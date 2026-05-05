require 'sinatra'
require 'json'
require 'rack/cors'
require 'mailtrap'

MAILTRAP_API_KEY = '97fe49880467c1d31b2951d70c854d81'
TO_EMAIL        = 'aakash.sethi7@gmail.com'
FROM_EMAIL      = 'hello@tnufa.ai'
FROM_NAME       = 'Portfolio Contact'

use Rack::Cors do
  allow do
    origins 'localhost:4000', '127.0.0.1:4000'
    resource '/contact', headers: :any, methods: [:post, :options]
  end
end

set :port, 4001
set :bind, '127.0.0.1'

post '/contact' do
  content_type :json

  body   = JSON.parse(request.body.read) rescue {}
  name   = body['name'].to_s.strip
  email  = body['email'].to_s.strip
  msg    = body['message'].to_s.strip

  halt 400, { error: 'Name and message are required.' }.to_json if name.empty? || msg.empty?

  text_body = <<~TEXT
    New portfolio message
    ─────────────────────
    From:    #{name}
    Email:   #{email.empty? ? '(not provided)' : email}

    #{msg}
  TEXT

  mail = Mailtrap::Mail::Base.new(
    from:    { email: FROM_EMAIL, name: FROM_NAME },
    to:      [{ email: TO_EMAIL }],
    subject: "Portfolio message from #{name}",
    text:    text_body,
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
