require 'sinatra'
require 'json'
require 'rack/cors'
require 'mailtrap'
require 'net/http'
require 'uri'

# Optional JobBoating backend (auth + tailor + scheduler). Loads only if the
# module files are present AND DATABASE_URL is set — otherwise the routes stay
# unregistered and the frontend degrades to its "backendDown" state.
JOBBOATING_ENABLED = ENV['DATABASE_URL'] &&
  File.exist?(File.expand_path('lib/store.rb', __dir__))
if JOBBOATING_ENABLED
  require_relative 'lib/store'
  require_relative 'lib/limiter'
  require_relative 'lib/auth'
  require_relative 'lib/tailor'
  require_relative 'lib/schedules'
end

MAILTRAP_API_KEY    = ENV['MAILTRAP_API_KEY']    # checked per request; /contact returns 503 if missing
BUTTONDOWN_API_KEY  = ENV['BUTTONDOWN_API_KEY']  # checked per request; /subscribe returns 503 if missing
TO_EMAIL            = ENV.fetch('TO_EMAIL',   'aakash.sethi7@gmail.com')
FROM_EMAIL          = ENV.fetch('FROM_EMAIL', 'hello@tnufa.ai')
FROM_NAME           = 'Portfolio Contact'

warn '⚠ MAILTRAP_API_KEY is not set — /contact will return 503 until configured.' unless MAILTRAP_API_KEY
warn '⚠ BUTTONDOWN_API_KEY is not set — /subscribe will return 503 until configured.' unless BUTTONDOWN_API_KEY
warn '⚠ DATABASE_URL is not set — JobBoating (/tailor, /schedules, /auth) disabled.' unless JOBBOATING_ENABLED

use Rack::Cors do
  allow do
    origins 'http://localhost:4000', 'http://127.0.0.1:4000',
            'http://localhost:4001', 'http://127.0.0.1:4001',
            'https://aakashsethi.github.io'
    resource '/contact',    headers: :any, methods: [:post, :options], credentials: true
    resource '/subscribe',  headers: :any, methods: [:post, :options], credentials: true
    resource '/auth/*',     headers: :any, methods: [:get, :post, :delete, :options], credentials: true
    resource '/tailor*',    headers: :any, methods: [:get, :post, :options], credentials: true
    resource '/schedules*', headers: :any, methods: [:get, :post, :options], credentials: true
  end
end

helpers do
  def client_ip
    request.env['HTTP_X_FORWARDED_FOR']&.split(',')&.first&.strip || request.ip
  end
  def client_ua
    request.env['HTTP_USER_AGENT'].to_s
  end
  def current_user
    return nil unless JOBBOATING_ENABLED
    Auth.current_user(request.cookies[Auth::COOKIE_NAME])
  end
  def require_user!
    u = current_user
    halt 401, { error: 'auth_required' }.to_json unless u
    u
  end
end

set :port, ENV.fetch('PORT', 4001).to_i
set :bind, '0.0.0.0'

def blank?(s) = s.nil? || s.to_s.strip.empty?
def f(v) = blank?(v) ? '(not provided)' : v

post '/contact' do
  content_type :json

  unless MAILTRAP_API_KEY && !MAILTRAP_API_KEY.strip.empty?
    halt 503, { error: 'Contact endpoint not configured. Missing MAILTRAP_API_KEY.' }.to_json
  end

  b = JSON.parse(request.body.read) rescue {}

  track     = b['track'].to_s.strip.downcase
  track     = 'coaching' if track.empty? # back-compat with old payloads
  name      = b['name'].to_s.strip
  email     = b['email'].to_s.strip
  linkedin  = b['linkedin'].to_s.strip
  company   = b['company'].to_s.strip
  booking   = b['booking'].to_s.strip
  meet_link = b['meetLink'].to_s.strip

  halt 400, { error: 'Name and email are required.' }.to_json if blank?(name) || blank?(email)

  booked_line = booking == 'yes' \
    ? "Booked:        YES — calendar slot selected" \
    : "Booked:        No calendar booking made"

  if track == 'consulting'
    scope    = b['scope'].to_s.strip
    problem  = b['problem'].to_s.strip
    stage    = b['stage'].to_s.strip
    timeline = b['timeline'].to_s.strip
    budget   = b['budget'].to_s.strip
    outcome  = b['outcome'].to_s.strip

    text_body = <<~TEXT
      ═══════════════════════════════════════
      NEW CONSULTING INQUIRY — AAKASH SETHI
      ═══════════════════════════════════════

      CONTACT
      ───────────────────────────────────────
      Name:          #{name}
      Email:         #{f(email)}
      LinkedIn:      #{f(linkedin)}
      Company:       #{f(company)}
      #{booked_line}

      GOOGLE MEET LINK
      ───────────────────────────────────────
      #{meet_link}

      ENGAGEMENT
      ───────────────────────────────────────
      Scope:         #{f(scope)}
      Stage:         #{f(stage)}
      Timeline:      #{f(timeline)}
      Budget:        #{f(budget)}

      Problem to solve:
      #{f(problem)}

      Definition of a win:
      #{f(outcome)}

      ═══════════════════════════════════════
    TEXT
    subject = booking == 'yes' \
      ? "Consulting meeting from #{name}" \
      : "Consulting inquiry from #{name}"
  else
    role      = b['role'].to_s.strip
    decision  = b['decision'].to_s.strip
    where     = b['where'].to_s.strip
    direction = b['direction'].to_s.strip
    support   = b['support'].to_s.strip
    useful    = b['useful'].to_s.strip
    timeline  = b['timeline'].to_s.strip

    text_body = <<~TEXT
      ═══════════════════════════════════════
      NEW COACHING REQUEST — AAKASH SETHI
      ═══════════════════════════════════════

      CONTACT
      ───────────────────────────────────────
      Name:          #{name}
      Email:         #{f(email)}
      LinkedIn:      #{f(linkedin)}
      #{booked_line}

      GOOGLE MEET LINK
      ───────────────────────────────────────
      #{meet_link}

      THEIR SITUATION
      ───────────────────────────────────────
      Current role:  #{f(role)}

      Decision facing:
      #{f(decision)}

      Where they are today:
      #{f(where)}

      DIRECTION & SUPPORT
      ───────────────────────────────────────
      Plausible next step:
      #{f(direction)}

      Support needed:
      #{f(support)}

      What would make this call useful:
      #{f(useful)}

      Timeline:      #{f(timeline)}

      ═══════════════════════════════════════
    TEXT
    subject = booking == 'yes' \
      ? "Coaching meeting from #{name}" \
      : "Coaching inquiry from #{name}"
  end

  mail = Mailtrap::Mail::Base.new(
    from:     { email: FROM_EMAIL, name: FROM_NAME },
    to:       [{ email: TO_EMAIL }],
    subject:  subject,
    text:     text_body,
    category: 'Portfolio Contact'
  )

  client = Mailtrap::Client.new(api_key: MAILTRAP_API_KEY)
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

# ── Newsletter subscribe (Buttondown via server-side API key) ─────────────
# Browser POSTs { email, tag } here; we forward to Buttondown's API with our
# secret key. Setting type: "regular" skips the double-opt-in confirmation
# email and creates an active subscriber immediately. Buttondown's welcome
# automation (if configured in their dashboard) fires on creation.
post '/subscribe' do
  content_type :json

  unless BUTTONDOWN_API_KEY && !BUTTONDOWN_API_KEY.strip.empty?
    halt 503, { error: 'Subscribe endpoint not configured. Missing BUTTONDOWN_API_KEY.' }.to_json
  end

  b = JSON.parse(request.body.read) rescue {}
  email = b['email'].to_s.strip
  tag   = b['tag'].to_s.strip

  halt 400, { error: 'Email is required.' }.to_json if blank?(email)
  unless email =~ /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/
    halt 400, { error: 'That email address does not look right.' }.to_json
  end

  uri = URI('https://api.buttondown.email/v1/subscribers')
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  http.open_timeout = 5
  http.read_timeout = 10

  payload = { email_address: email, type: 'regular' }
  payload[:tags] = [tag] unless blank?(tag)

  req = Net::HTTP::Post.new(uri)
  req['Authorization'] = "Token #{BUTTONDOWN_API_KEY}"
  req['Content-Type']  = 'application/json'
  req.body = payload.to_json

  res = http.request(req)
  code = res.code.to_i

  case code
  when 200, 201
    { ok: true }.to_json
  when 400
    # Buttondown returns 400 for "already subscribed" — treat as success so the
    # user sees a friendly message either way.
    body = JSON.parse(res.body) rescue { 'detail' => res.body }
    if body['detail'].to_s.downcase.include?('already')
      { ok: true, already: true }.to_json
    else
      halt 400, { error: body['detail'] || 'Subscription failed.' }.to_json
    end
  else
    halt 502, { error: "Buttondown returned #{code}." }.to_json
  end
rescue => e
  halt 500, { error: e.message }.to_json
end

# ── JobBoating (auth + tailor + scheduler) ──────────────────────────────────
# Registered only when DATABASE_URL is set (see JOBBOATING_ENABLED above).
if JOBBOATING_ENABLED
  post '/auth/request' do
    content_type :json
    b = JSON.parse(request.body.read) rescue {}
    res = Auth.request_magic_link(email: b['email'], ip: client_ip, ua: client_ua)
    halt 400, { error: res[:error] }.to_json unless res[:ok]
    { ok: true, message: 'Check your email for a sign-in link.' }.to_json
  end

  get '/auth/consume' do
    token = params['token']
    res = Auth.consume(token: token, ip: client_ip, ua: client_ua)
    unless res[:ok]
      content_type :html
      return "<h1>Sign-in link problem</h1><p>#{res[:error].to_s.tr('_', ' ')}. Request a new link and try again.</p>"
    end
    response.set_cookie(Auth::COOKIE_NAME, { value: res[:session_id], **Auth.cookie_opts(max_age: Auth::SESSION_TTL) })
    redirect "#{Auth.frontend_url}/#tailor?signed_in=1"
  end

  get '/auth/me' do
    content_type :json
    u = current_user
    halt 200, { authenticated: false }.to_json unless u
    { authenticated: true, email: u[:email] }.to_json
  end

  post '/auth/signout' do
    content_type :json
    Auth.revoke(request.cookies[Auth::COOKIE_NAME])
    response.delete_cookie(Auth::COOKIE_NAME, path: '/')
    { ok: true }.to_json
  end

  delete '/auth/me' do
    content_type :json
    u = require_user!
    Auth.delete_user(u[:id])
    response.delete_cookie(Auth::COOKIE_NAME, path: '/')
    { ok: true, deleted: true }.to_json
  end

  post '/tailor' do
    content_type :json
    b = JSON.parse(request.body.read) rescue {}
    jd     = b['jd'].to_s.strip
    resume = b['resume'].to_s.strip
    halt 400, { error: 'Both job description and resume are required.' }.to_json if jd.empty? || resume.empty?
    halt 413, { error: 'Input too long. Keep each under 20 000 characters.' }.to_json if jd.length > 20_000 || resume.length > 20_000

    user = current_user
    if user
      limit = Tailor::AUTHED_DAILY_MAX
      subject_kind = 'user'
      subject_key  = user[:id].to_s
    else
      limit = Tailor::ANON_DAILY_MAX
      subject_kind = 'ip'
      subject_key  = Limiter.hash(client_ip)
    end

    unless Limiter.groq_global_ok?
      halt 503, { error: 'The tailor is paused for the day — a global usage cap hit. Try again after midnight UTC.', paused: true }.to_json
    end

    quota = Limiter.check_and_increment(subject_kind: subject_kind, subject_key: subject_key, feature: 'tailor', per_day_max: limit)
    unless quota[:ok]
      code = user ? 429 : 402
      halt code, {
        error: user ? 'Daily limit reached.' : 'Sign in to continue.',
        signin_required: !user, remaining: 0
      }.to_json
    end

    result = Tailor.run(jd: jd, resume: resume)
    Tailor.save_history(user_id: user[:id], jd: jd, resume: resume, tailored: result[:tailored], rationale: result[:rationale], model: result[:model]) if user

    { ok: true, tailored: result[:tailored], rationale: result[:rationale], remaining: quota[:remaining] }.to_json
  rescue Tailor::Error => e
    halt 502, { error: "Upstream model error: #{e.message}" }.to_json
  end

  get '/tailor/quota.json' do
    content_type :json
    user = current_user
    if user
      remaining = Limiter.remaining(subject_kind: 'user', subject_key: user[:id].to_s, feature: 'tailor', per_day_max: Tailor::AUTHED_DAILY_MAX)
      { authenticated: true, remaining: remaining, limit: Tailor::AUTHED_DAILY_MAX }.to_json
    else
      remaining = Limiter.remaining(subject_kind: 'ip', subject_key: Limiter.hash(client_ip), feature: 'tailor', per_day_max: Tailor::ANON_DAILY_MAX)
      { authenticated: false, remaining: remaining, limit: Tailor::ANON_DAILY_MAX }.to_json
    end
  end

  get '/tailor/history.json' do
    content_type :json
    u = require_user!
    Tailor.history(user_id: u[:id]).to_json
  end

  post '/schedules' do
    content_type :json
    u = require_user!
    b = JSON.parse(request.body.read) rescue {}
    res = Schedules.upsert(user_id: u[:id], week_of: b['week_of'], cells: b['cells'], rules: b['rules'])
    halt 400, { error: res[:error] }.to_json unless res[:ok]
    res.to_json
  end

  get '/schedules/mine.json' do
    content_type :json
    u = require_user!
    Schedules.mine(user_id: u[:id]).to_json
  end

  get '/schedules/:public_id.json' do
    content_type :json
    s = Schedules.by_public_id(params['public_id']) or halt 404, { error: 'not_found' }.to_json
    s.to_json
  end
end
