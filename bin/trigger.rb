#!/usr/bin/env ruby
require 'httparty'
require 'json'

action = ARGV[0] or abort "usage: trigger.rb <action>"
url    = ENV.fetch('TRIGGER_URL')
secret = ENV.fetch('TRIGGER_SECRET')

res = HTTParty.post(url,
  headers: { 'X-Trigger-Secret' => secret, 'Content-Type' => 'application/json' },
  body: { action: action }.to_json,
  timeout: 120
)

puts "#{res.code} #{res.body}"
exit(res.code.between?(200, 299) ? 0 : 1)
