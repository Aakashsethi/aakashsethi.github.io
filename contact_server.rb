require 'sinatra'
require 'json'
require 'rack/cors'
require 'mailtrap'
require 'securerandom'
require_relative 'lib/linkedin_client'
require_relative 'lib/post_generator'
require_relative 'lib/image_generator'
require_relative 'lib/blog_generator'
require_relative 'lib/store'

MAILTRAP_API_KEY = ENV.fetch('MAILTRAP_API_KEY')
BUTTONDOWN_API_KEY = ENV['BUTTONDOWN_API_KEY']  # lazy-checked per request; /subscribe returns 503 if missing
TO_EMAIL         = ENV.fetch('TO_EMAIL',  'aakash.sethi7@gmail.com')
FROM_EMAIL       = ENV.fetch('FROM_EMAIL', 'hello@tnufa.ai')
FROM_NAME        = 'Portfolio Contact'
OAUTH_STATE_SECRET = ENV.fetch('OAUTH_STATE_SECRET', SecureRandom.hex(16))
TRIGGER_SECRET   = ENV.fetch('TRIGGER_SECRET', nil)

use Rack::Cors do
  allow do
    origins 'localhost:4000', '127.0.0.1:4000',
            'aakashsethi.github.io', 'https://aakashsethi.github.io'
    resource '/contact', headers: :any, methods: [:post, :options]
    resource '/subscribe', headers: :any, methods: [:post, :options]
    resource '/posts.json', headers: :any, methods: [:get, :options]
    resource '/blog.json', headers: :any, methods: [:get, :options]
    resource '/blog/*', headers: :any, methods: [:get, :options]
  end
end

def mail_client
  Mailtrap::Client.new(api_key: MAILTRAP_API_KEY)
end

def send_admin_mail(subject, text)
  mail = Mailtrap::Mail::Base.new(
    from: { email: FROM_EMAIL, name: FROM_NAME },
    to:   [{ email: TO_EMAIL }],
    subject: subject,
    text: text,
    category: 'Portfolio Automation'
  )
  mail_client.send(mail)
rescue => e
  warn "[mail] failed: #{e.message}"
end

set :port, ENV.fetch('PORT', 4001).to_i
set :bind, '0.0.0.0'

def blank?(s) = s.nil? || s.to_s.strip.empty?

post '/contact' do
  content_type :json

  b = JSON.parse(request.body.read) rescue {}

  name      = b['name'].to_s.strip
  email     = b['email'].to_s.strip
  linkedin  = b['linkedin'].to_s.strip
  role      = b['role'].to_s.strip
  decision  = b['decision'].to_s.strip
  where     = b['where'].to_s.strip
  direction = b['direction'].to_s.strip
  support   = b['support'].to_s.strip
  useful    = b['useful'].to_s.strip
  timeline  = b['timeline'].to_s.strip
  booking   = b['booking'].to_s.strip
  meet_link = b['meetLink'].to_s.strip

  halt 400, { error: 'Name and email are required.' }.to_json if blank?(name) || blank?(email)

  booked_line = booking == 'yes' \
    ? "Booked:        YES — calendar slot selected" \
    : "Booked:        No calendar booking made"

  text_body = <<~TEXT
    ═══════════════════════════════════════
    NEW MEETING REQUEST — AAKASH SETHI PORTFOLIO
    ═══════════════════════════════════════

    CONTACT
    ───────────────────────────────────────
    Name:          #{name}
    Email:         #{blank?(email) ? '(not provided)' : email}
    LinkedIn:      #{blank?(linkedin) ? '(not provided)' : linkedin}
    #{booked_line}

    GOOGLE MEET LINK
    ───────────────────────────────────────
    #{meet_link}

    THEIR SITUATION
    ───────────────────────────────────────
    Current role:  #{blank?(role) ? '(not provided)' : role}

    Decision facing:
    #{blank?(decision) ? '(not provided)' : decision}

    Where they are today:
    #{blank?(where) ? '(not provided)' : where}

    DIRECTION & SUPPORT
    ───────────────────────────────────────
    Plausible next step:
    #{blank?(direction) ? '(not provided)' : direction}

    Support needed:
    #{blank?(support) ? '(not provided)' : support}

    What would make this call useful:
    #{blank?(useful) ? '(not provided)' : useful}

    Timeline:      #{blank?(timeline) ? '(not provided)' : timeline}

    ═══════════════════════════════════════
  TEXT

  subject = booking == 'yes' \
    ? "Meeting request from #{name}" \
    : "Inquiry from #{name}"

  mail = Mailtrap::Mail::Base.new(
    from:     { email: FROM_EMAIL, name: FROM_NAME },
    to:       [{ email: TO_EMAIL }],
    subject:  subject,
    text:     text_body,
    category: 'Portfolio Contact'
  )

  client = mail_client
  client.send(mail)

  # Confirmation email to the user with the Meet link
  if booking == 'yes' && !blank?(email)
    confirmation_body = <<~TEXT
      Hi #{name},

      Thanks for reaching out. Your details have been received and I'll review them before we meet.

      ───────────────────────────────────────
      YOUR GOOGLE MEET LINK
      ───────────────────────────────────────
      #{meet_link}

      Use this link to join at your scheduled time. A calendar confirmation with the exact time was sent separately when you booked.

      Looking forward to the conversation.

      — Aakash Sethi
        aakash.sethi7@gmail.com
        https://aakashsethi.github.io
      ───────────────────────────────────────
    TEXT

    confirmation = Mailtrap::Mail::Base.new(
      from:     { email: FROM_EMAIL, name: 'Aakash Sethi' },
      to:       [{ email: email, name: name }],
      subject:  'Your meeting details — Aakash Sethi',
      text:     confirmation_body,
      category: 'Portfolio Contact'
    )
    client.send(confirmation)
  end

  { ok: true }.to_json
rescue Mailtrap::Error => e
  halt 502, { error: "Mailtrap error: #{e.message}" }.to_json
rescue => e
  halt 500, { error: e.message }.to_json
end

# ── LinkedIn OAuth ───────────────────────────────────────────────────────────
get '/auth/linkedin' do
  state = SecureRandom.hex(16)
  response.set_cookie('li_oauth_state',
    value: state, httponly: true, secure: true, same_site: :lax, path: '/')
  redirect LinkedInClient.authorize_url(state)
end

get '/auth/linkedin/callback' do
  expected = request.cookies['li_oauth_state']
  halt 400, 'Missing or mismatched state.' if expected.nil? || expected != params['state']

  if params['error']
    halt 400, "LinkedIn error: #{params['error']} — #{params['error_description']}"
  end

  tokens = LinkedInClient.exchange_code(params['code'])
  user   = LinkedInClient.userinfo(tokens['access_token'])

  Store.save_token(
    access: tokens['access_token'],
    refresh: tokens['refresh_token'],
    access_expires_in: tokens['expires_in'].to_i,
    refresh_expires_in: tokens['refresh_token_expires_in']&.to_i,
    person_urn: user['sub']
  )

  response.delete_cookie('li_oauth_state', path: '/')
  content_type :html
  "<h1>LinkedIn connected →</h1><p>Account: #{user['name']}</p><p>You can close this tab.</p>"
rescue => e
  halt 500, "OAuth callback failed: #{e.message}"
end

# ── Internal trigger (called by Render cron jobs) ────────────────────────────
post '/internal/trigger' do
  content_type :json
  halt 401, { error: 'auth' }.to_json if TRIGGER_SECRET.nil? || request.env['HTTP_X_TRIGGER_SECRET'] != TRIGGER_SECRET

  action = params['action'] || (JSON.parse(request.body.read) rescue {})['action']
  case action
  when 'daily_post' then run_daily_post
  when 'token_check' then run_token_check
  when 'generate_blog' then run_generate_blog
  else halt 400, { error: "unknown action #{action}" }.to_json
  end
end

def run_daily_post
  recent = Store.recent_source_urls(days: 30)
  draft  = PostGenerator.generate(recent_urls: recent)

  image = nil
  if ENV['FAL_KEY']
    begin
      img_prompt = ImageGenerator.prompt_from_post(draft[:body], draft[:category])
      image = ImageGenerator.generate(img_prompt)
    rescue => e
      warn "[daily_post] image generation failed: #{e.message}"
    end
  end

  urn = LinkedInClient.post_text(draft[:body], image: image)
  Store.record_post(
    category: draft[:category], source_url: draft[:source_url],
    source_title: draft[:source_title], body: draft[:body], urn: urn
  )
  { ok: true, urn: urn, category: draft[:category], image: !image.nil? }.to_json
rescue => e
  Store.record_post(
    category: (draft && draft[:category]) || 'unknown',
    source_url: draft && draft[:source_url],
    source_title: draft && draft[:source_title],
    body: (draft && draft[:body]).to_s,
    urn: nil, error: e.message
  )
  send_admin_mail('LinkedIn daily post FAILED', "Error: #{e.message}\n\nDraft:\n#{draft && draft[:body]}")
  halt 500, { error: e.message }.to_json
end

def run_token_check
  tok = Store.token
  if tok.nil?
    send_admin_mail('LinkedIn not connected', "Visit https://portfolio-contact.onrender.com/auth/linkedin to authorize.")
    return { ok: true, status: 'not_connected' }.to_json
  end
  days_left = ((tok['refresh_expires_at'] || tok['access_expires_at']) - Time.now.to_i) / 86_400
  if days_left < 14
    send_admin_mail("LinkedIn re-auth needed in #{days_left}d",
      "Refresh token expires in #{days_left} days.\nRe-authorize: https://portfolio-contact.onrender.com/auth/linkedin")
  end
  { ok: true, days_left: days_left }.to_json
end

# ── Public posts feed (for /posts page on Jekyll site) ───────────────────────
get '/posts.json' do
  content_type :json
  Store.recent_posts(limit: 20).map do |p|
    {
      category: p['category'],
      body: p['body'],
      source_url: p['source_url'],
      source_title: p['source_title'],
      linkedin_urn: p['linkedin_urn'],
      posted_at: p['posted_at']
    }
  end.to_json
end

def run_generate_blog
  recent = Store.recent_blog_source_urls(days: 60)
  draft  = BlogGenerator.generate(recent_urls: recent)
  Store.save_blog(
    slug: draft[:slug], title: draft[:title], summary: draft[:summary],
    body_md: draft[:body_md], category: draft[:category], sources: draft[:sources]
  )
  { ok: true, slug: draft[:slug], category: draft[:category], words: draft[:body_md].split(/\s+/).size }.to_json
rescue => e
  send_admin_mail('Blog generation FAILED', "Error: #{e.message}")
  halt 500, { error: e.message }.to_json
end

# ── Public blog feed ─────────────────────────────────────────────────────────
get '/blog.json' do
  content_type :json
  Store.recent_blog(limit: 50).map do |p|
    { slug: p['slug'], title: p['title'], summary: p['summary'],
      category: p['category'], created_at: p['created_at'] }
  end.to_json
end

get '/blog/:slug.json' do
  content_type :json
  p = Store.blog_by_slug(params['slug']) or halt 404, { error: 'not_found' }.to_json
  { slug: p['slug'], title: p['title'], summary: p['summary'], category: p['category'],
    sources: JSON.parse(p['sources_json'] || '[]'), body_md: p['body_md'],
    created_at: p['created_at'] }.to_json
end

# ── Newsletter subscribe (Buttondown via server-side API key) ────────────────
# type: "regular" skips double-opt-in; Buttondown's welcome automation still fires.
post '/subscribe' do
  content_type :json

  if BUTTONDOWN_API_KEY.nil? || BUTTONDOWN_API_KEY.strip.empty?
    halt 503, { error: 'Subscribe endpoint not configured. Missing BUTTONDOWN_API_KEY.' }.to_json
  end

  b = JSON.parse(request.body.read) rescue {}
  email = b['email'].to_s.strip
  tag   = b['tag'].to_s.strip

  halt 400, { error: 'Email is required.' }.to_json if blank?(email)
  unless email =~ /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/
    halt 400, { error: 'That email address does not look right.' }.to_json
  end

  payload = { email_address: email, type: 'regular' }
  payload[:tags] = [tag] unless blank?(tag)

  res = HTTParty.post(
    'https://api.buttondown.email/v1/subscribers',
    headers: {
      'Authorization' => "Token #{BUTTONDOWN_API_KEY}",
      'Content-Type'  => 'application/json'
    },
    body: payload.to_json,
    timeout: 10
  )

  case res.code
  when 200, 201
    { ok: true }.to_json
  when 400
    # Buttondown returns 400 for "already subscribed" — treat as success.
    body = JSON.parse(res.body) rescue { 'detail' => res.body }
    if body['detail'].to_s.downcase.include?('already')
      { ok: true, already: true }.to_json
    else
      halt 400, { error: body['detail'] || 'Subscription failed.' }.to_json
    end
  else
    halt 502, { error: "Buttondown returned #{res.code}." }.to_json
  end
rescue => e
  halt 500, { error: e.message }.to_json
end
