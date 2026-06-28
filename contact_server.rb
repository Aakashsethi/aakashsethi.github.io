require 'sinatra'
require 'json'
require 'rack/cors'
require 'mailtrap'
require 'net/http'
require 'uri'

MAILTRAP_API_KEY    = ENV['MAILTRAP_API_KEY']    # checked per request; /contact returns 503 if missing
BUTTONDOWN_API_KEY  = ENV['BUTTONDOWN_API_KEY']  # checked per request; /subscribe returns 503 if missing
TO_EMAIL            = ENV.fetch('TO_EMAIL',   'aakash.sethi7@gmail.com')
FROM_EMAIL          = ENV.fetch('FROM_EMAIL', 'hello@tnufa.ai')
FROM_NAME           = 'Portfolio Contact'

warn '⚠ MAILTRAP_API_KEY is not set — /contact will return 503 until configured.' unless MAILTRAP_API_KEY
warn '⚠ BUTTONDOWN_API_KEY is not set — /subscribe will return 503 until configured.' unless BUTTONDOWN_API_KEY

use Rack::Cors do
  allow do
    origins 'localhost:4000', '127.0.0.1:4000',
            'aakashsethi.github.io', 'https://aakashsethi.github.io'
    resource '/contact',   headers: :any, methods: [:post, :options]
    resource '/subscribe', headers: :any, methods: [:post, :options]
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
