require 'securerandom'
require 'digest'
require 'httparty'
require 'mailtrap'
require_relative 'store'
require_relative 'limiter'

module Auth
  MAGIC_LINK_TTL   = 15 * 60          # 15 minutes
  SESSION_TTL      = 30 * 86_400      # 30 days
  MAGIC_LINK_MIN_INTERVAL = 60        # 1 request per email per 60s

  COOKIE_NAME = 'aa_sess'

  def self.frontend_url
    ENV.fetch('FRONTEND_URL', 'http://localhost:4000')
  end

  def self.api_url
    ENV.fetch('API_URL', 'http://localhost:4001')
  end

  def self.production?
    ENV['RACK_ENV'] == 'production'
  end

  # ── Magic link ────────────────────────────────────────────────────────────
  # Returns { ok: true } or { ok: false, error: '...' }
  def self.request_magic_link(email:, ip:, ua:)
    email = email.to_s.strip.downcase
    return { ok: false, error: 'Email is required.' } if email.empty?
    return { ok: false, error: 'That email address does not look right.' } unless email =~ /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/

    # Rate-limit: 1 per email per 60s
    recent = Store.conn.exec_params(
      'SELECT created_at FROM magic_links WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
      [email]
    ).first
    if recent && (Time.now.to_i - recent['created_at'].to_i) < MAGIC_LINK_MIN_INTERVAL
      return { ok: false, error: 'A link was just sent — check your inbox.' }
    end

    token = SecureRandom.urlsafe_base64(32)
    now = Time.now.to_i
    Store.conn.exec_params(
      'INSERT INTO magic_links (token, email, expires_at, ip_hash, ua_hash, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [token, email, now + MAGIC_LINK_TTL, Limiter.hash(ip), Limiter.hash(ua), now]
    )

    send_link(email, token)
    { ok: true }
  rescue => e
    warn "[auth] request_magic_link failed: #{e.class} #{e.message}"
    { ok: false, error: 'Something went wrong sending the link. Try again shortly.' }
  end

  def self.send_link(email, token)
    link = "#{api_url}/auth/consume?token=#{token}"
    body = <<~TEXT
      Sign in to Aakash's demos

      Click the link below to sign in. Expires in 15 minutes.

      #{link}

      Didn't request this? You can ignore this email — the link expires shortly and no account was created.
    TEXT

    mail = Mailtrap::Mail::Base.new(
      from:     { email: ENV.fetch('FROM_EMAIL', 'hello@tnufa.ai'), name: 'Aakash Sethi' },
      to:       [{ email: email }],
      subject:  'Your sign-in link',
      text:     body,
      category: 'Portfolio Auth'
    )
    Mailtrap::Client.new(api_key: ENV.fetch('MAILTRAP_API_KEY')).send(mail)
  end

  # Returns { ok: true, session_id: '...', user_id: id } or { ok: false, error: '...' }
  def self.consume(token:, ip:, ua:)
    now = Time.now.to_i
    row = Store.conn.exec_params(
      'SELECT * FROM magic_links WHERE token = $1',
      [token]
    ).first
    return { ok: false, error: 'invalid_link' } unless row
    return { ok: false, error: 'expired_link' } if row['expires_at'].to_i < now
    return { ok: false, error: 'already_used' } if row['used_at']

    email = row['email']

    # Ensure user
    user = Store.conn.exec_params('SELECT id FROM users WHERE email = $1', [email]).first
    if user
      user_id = user['id'].to_i
      Store.conn.exec_params('UPDATE users SET last_login_at = $1 WHERE id = $2', [now, user_id])
    else
      user_id = Store.conn.exec_params(
        'INSERT INTO users (email, created_at, last_login_at) VALUES ($1, $2, $2) RETURNING id',
        [email, now]
      ).first['id'].to_i
    end

    Store.conn.exec_params('UPDATE magic_links SET used_at = $1 WHERE token = $2', [now, token])

    # Create session
    session_id = SecureRandom.hex(32)
    Store.conn.exec_params(<<~SQL, [session_id, user_id, now, now, now + SESSION_TTL, Limiter.hash(ip), Limiter.hash(ua)])
      INSERT INTO sessions (id, user_id, created_at, last_seen_at, expires_at, ip_hash, ua_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    SQL

    { ok: true, session_id: session_id, user_id: user_id, email: email }
  end

  # Given a session cookie value, return { id:, email: } or nil
  def self.current_user(session_id)
    return nil if session_id.nil? || session_id.empty?
    now = Time.now.to_i
    row = Store.conn.exec_params(<<~SQL, [session_id, now]).first
      SELECT s.id AS sid, s.user_id, s.expires_at, s.revoked_at, u.email
      FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = $1 AND s.expires_at > $2 AND s.revoked_at IS NULL
    SQL
    return nil unless row
    Store.conn.exec_params('UPDATE sessions SET last_seen_at = $1 WHERE id = $2', [now, session_id])
    { id: row['user_id'].to_i, email: row['email'] }
  end

  def self.revoke(session_id)
    return if session_id.nil? || session_id.empty?
    Store.conn.exec_params('UPDATE sessions SET revoked_at = $1 WHERE id = $2', [Time.now.to_i, session_id])
  end

  def self.delete_user(user_id)
    Store.conn.exec_params('DELETE FROM users WHERE id = $1', [user_id])
  end

  # Cookie options helper for Sinatra
  def self.cookie_opts(max_age:)
    {
      httponly: true,
      secure:   production?,
      same_site: production? ? :none : :lax,
      path:      '/',
      max_age:   max_age
    }
  end
end
