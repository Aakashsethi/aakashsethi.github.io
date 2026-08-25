# Single source of truth for the Groq model id. Both lib/tailor.rb and
# bin/generate_weekly_post.rb read from here so a deprecation swap is
# one line, and the canary workflow ships the same string to Groq.
#
# GROQ_MODEL env var overrides for CI or local experiments.
module GroqConfig
  MODEL = ENV.fetch('GROQ_MODEL', 'openai/gpt-oss-120b')
end
