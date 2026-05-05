require 'sinatra'
require 'json'
require 'rack/cors'
require 'mailtrap'

MAILTRAP_API_KEY = ENV.fetch('MAILTRAP_API_KEY', '97fe49880467c1d31b2951d70c854d81')
TO_EMAIL         = ENV.fetch('TO_EMAIL',         'aakash.sethi7@gmail.com')
FROM_EMAIL       = ENV.fetch('FROM_EMAIL',        'hello@tnufa.ai')
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

post '/contact' do
  content_type :json

  body    = JSON.parse(request.body.read) rescue {}
  name    = body['name'].to_s.strip
  email   = body['email'].to_s.strip
  msg     = body['message'].to_s.strip
  booking = body['booking'].to_s.strip

  halt 400, { error: 'Name and message are required.' }.to_json if name.empty? || msg.empty?

  meeting_line = booking == 'yes' \
    ? "Meeting:  Appointment booked via Google Calendar\n" \
    : "Meeting:  (no calendar booking)\n"

  text_body = <<~TEXT
    New appointment request
    ───────────────────────
    From:    #{name}
    Email:   #{email.empty? ? '(not provided)' : email}
    #{meeting_line}
    What they're working on:
    #{msg}
  TEXT

  subject = booking == 'yes' ? "Meeting request from #{name}" : "Message from #{name}"

  mail = Mailtrap::Mail::Base.new(
    from:     { email: FROM_EMAIL, name: FROM_NAME },
    to:       [{ email: TO_EMAIL }],
    subject:  subject,
    text:     text_body,
    category: 'Portfolio Contact'
  )

  client = Mailtrap::Client.new(api_key: MAILTRAP_API_KEY)
  client.send(mail)

  { ok: true }.to_json
rescue Mailtrap::Error => e
  halt 502, { error: "Mailtrap error: #{e.message}" }.to_json
rescue => e
  halt 500, { error: e.message }.to_json
end
