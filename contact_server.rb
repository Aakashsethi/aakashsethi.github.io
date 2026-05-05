require 'sinatra'
require 'json'
require 'rack/cors'
require 'mailtrap'

MAILTRAP_API_KEY = ENV.fetch('MAILTRAP_API_KEY', '97fe49880467c1d31b2951d70c854d81')
TO_EMAIL         = ENV.fetch('TO_EMAIL',          'aakash.sethi7@gmail.com')
FROM_EMAIL       = ENV.fetch('FROM_EMAIL',         'hello@tnufa.ai')
FROM_NAME        = 'Portfolio Contact'

use Rack::Cors do
  allow do
    origins 'localhost:4000', '127.0.0.1:4000',
            'aakashsethi.github.io', 'https://aakashsethi.github.io'
    resource '/contact', headers: :any, methods: [:post, :options]
  end
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
