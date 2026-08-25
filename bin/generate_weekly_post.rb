#!/usr/bin/env ruby
# Generates one Jekyll _posts/ markdown file in the voice + depth of the
# existing site. Runs from the weekly-blog GitHub Actions workflow.
#
# Env inputs:
#   GROQ_API_KEY  — required
#   GROQ_MODEL    — optional, defaults to llama-3.3-70b-versatile
#   POSTS_DIR     — optional, defaults to _posts

require 'net/http'
require 'uri'
require 'json'
require 'date'
require 'fileutils'

GROQ_API_KEY = ENV.fetch('GROQ_API_KEY')
require_relative '../lib/groq_config'
GROQ_MODEL   = GroqConfig::MODEL
FAL_KEY      = ENV['FAL_KEY']  # optional — skip image gen if unset
FAL_MODEL    = ENV.fetch('FAL_MODEL', 'fal-ai/flux/schnell')
POSTS_DIR    = ENV.fetch('POSTS_DIR', 'src/content/blog')
IMAGES_DIR   = ENV.fetch('IMAGES_DIR', 'public/assets/blog')

CATEGORY_WEIGHTS = {
  'AI Engineering'   => 30,
  'Society & Tech'   => 20,
  'Career'           => 15,
  'AWS & Cloud'      => 10,
  'Fintech'          => 10,
  'Product'          => 10,
  'Story'            => 5
}.freeze

def weighted_pick
  total = CATEGORY_WEIGHTS.values.sum
  roll = rand(total)
  cum = 0
  CATEGORY_WEIGHTS.each do |cat, w|
    cum += w
    return cat if roll < cum
  end
  'AI Engineering'
end

def prompt(category)
  <<~PROMPT
    You are writing a long-form blog post for Aakash Sethi's personal site at aakashsethi.github.io.

    ABOUT AAKASH
    - AI software engineer. AWS Certified Solutions Architect Professional.
    - Founder of Tnufa.ai (skill-based career mobility platform).
    - Five years production experience: Vanguard, Mercedes-Benz Financial Services, Burpez.
    - NJDOE-licensed CS educator on the side. Based in New Jersey.

    VOICE — HARD RULES
    - First person, present tense. Aakash writes as himself.
    - Confident, not boastful. State the work. Never "I think", "I believe", or hedging fillers.
    - Technical without jargon-flexing. If you name a framework, tool, or paper, say WHY you picked it.
    - Specific over general. Numbers, concrete examples, actual production stories beat abstractions.
    - No hype words: game-changer, revolutionary, leverage, synergy, unlock, cutting-edge, harness, elevate, empower.
    - No filler openers: "In today's rapidly evolving world…", "It's no secret that…", "In this post I'll…"
    - Em-dashes (—) for asides. Slashes (/) for related concepts. Right-arrows (→) for CTAs.
    - No emoji. No ALL CAPS except at most one eyebrow phrase.
    - It is fine — encouraged — to say "I don't know" or "I might be wrong about this" when honest.
    - Longform is expected. This is a working essay, not a LinkedIn snippet.

    STRUCTURE — MATCH EXISTING BLOG DEPTH
    Existing posts on this site are 2000–3500 words. They cite real books, papers, and thinkers by name — Habermas, Bagdikian, Chomsky, Christensen, real production experiences. They read like they were written by someone who reads for a living.

    Your post MUST:
    - Be a MINIMUM of 2000 words in the body — this is a hard floor, not a suggestion. Anything under 2000 words is a failed output that will be rejected. Aim for 2400–2800.
    - Open with a specific hook (a stat, a bug, a contradiction, a scene) — NOT a definition or generic setup.
    - Have 5–7 H2 sections. Each section must be at least 300 words. Section titles must be sentence case and CONCRETE (e.g. "Six companies, 90 percent of everything" not "Introduction to media consolidation").
    - Include at least one blockquote pulled from a real named source you know exists.
    - Include at least one specific number, code snippet, worked example, or short numbered list.
    - Cite real books/papers/thinkers by name where relevant — but ONLY citations you are highly confident actually exist. Do not invent titles, authors, or page numbers. If unsure, hedge or omit.
    - End with a concrete takeaway the reader could act on this week — not "hope this helps".
    - Do NOT include filler phrases like "In conclusion", "To sum up", "As I mentioned earlier". Just say the thing.
    - Do NOT include a "Follow for daily posts" or "P.S. Source:" line — this is a long-form essay, not a LinkedIn snippet.

    TOPIC CATEGORY
    #{category}

    Pick a specific, non-obvious angle within this category. Not "an intro to X". A structural argument, a countervailing take, a working-through-a-problem.

    OUTPUT
    Return STRICT JSON — no code fences, no commentary outside the JSON — with EXACTLY these keys:

    {
      "title": "Sentence case, under 90 chars. Real title, not clickbait.",
      "excerpt": "1–2 sentences, under 250 chars. Says what the piece actually argues.",
      "tags": ["3–7", "specific", "lowercase", "keywords"],
      "body": "Full markdown body. Starts with an H2 (##). Do NOT include the title as H1 inside the body. Do NOT include frontmatter."
    }
  PROMPT
end

def call_groq(prompt_text)
  uri = URI('https://api.groq.com/openai/v1/chat/completions')
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  http.read_timeout = 180

  req = Net::HTTP::Post.new(uri)
  req['Authorization'] = "Bearer #{GROQ_API_KEY}"
  req['Content-Type']  = 'application/json'
  req.body = {
    model: GROQ_MODEL,
    messages: [{ role: 'user', content: prompt_text }],
    temperature: 0.55,
    max_tokens: 6000,
    response_format: { type: 'json_object' }
  }.to_json

  res = http.request(req)
  raise "Groq #{res.code}: #{res.body[0, 400]}" unless res.code.to_i.between?(200, 299)
  content = JSON.parse(res.body).dig('choices', 0, 'message', 'content')
  raise "Groq returned empty content" if content.nil? || content.strip.empty?
  JSON.parse(content)
rescue JSON::ParserError => e
  raise "Groq returned non-JSON: #{e.message}"
end

def slugify(title)
  title.downcase
       .gsub(/[^a-z0-9\s-]/, '')
       .gsub(/\s+/, '-')
       .gsub(/-+/, '-')
       .gsub(/^-|-$/, '')[0, 70]
end

def format_frontmatter(title:, date:, category:, tags:, excerpt:, image_url: nil)
  yaml_tags = tags.map { |t| t.to_s.strip.gsub('"', "'") }.reject(&:empty?)
  image_line = image_url ? "image_url: \"#{image_url}\"\n" : ''
  <<~YAML
    ---
    title: "#{title.gsub('"', "'")}"
    date: #{date}
    categories: ["#{category}"]
    tags: [#{yaml_tags.join(', ')}]
    #{image_line.chomp}
    excerpt: "#{excerpt.gsub('"', "'").gsub("\n", ' ')}"
    ---
  YAML
end

def write_post(payload, category, image_url: nil)
  now = Time.now.utc
  slug  = slugify(payload.fetch('title'))
  # Astro content collection derives the URL slug from the filename (no date
  # prefix). The Jekyll-compat URL comes from `date` + `categories[0]` in
  # frontmatter, computed in src/lib/postUrl.ts at build time.
  filename = "#{slug}.md"
  path = File.join(POSTS_DIR, filename)

  frontmatter = format_frontmatter(
    title:     payload.fetch('title'),
    date:      now.strftime('%Y-%m-%d %H:%M:%S +0000'),
    category:  category,
    tags:      payload.fetch('tags', []),
    excerpt:   payload.fetch('excerpt', ''),
    image_url: image_url
  )

  body = payload.fetch('body').strip
  content = "#{frontmatter}\n#{body}\n"

  FileUtils.mkdir_p(POSTS_DIR)
  File.write(path, content)
  path
end

CATEGORY_STYLE = {
  'AI Engineering'  => 'abstract neural network topology, glowing nodes, dark warm background, editorial illustration',
  'Society & Tech'  => 'newspaper printing press abstracted, ink and paper textures, muted amber tones',
  'Career'          => 'geometric ladder rungs against a warm sunset gradient, minimalist illustration',
  'AWS & Cloud'     => 'stylized data center racks with soft glowing lights, isometric line art, warm palette',
  'Fintech'         => 'abstract stock market ticker as flowing ribbons, muted gold and ink tones',
  'Product'         => 'sketch of interlocking product design components, blueprint on kraft paper',
  'Story'           => 'quiet desk with open notebook and cup, morning light, editorial photo tone'
}.freeze

def build_image_prompt(title, category)
  style = CATEGORY_STYLE[category] || 'clean editorial illustration, warm desaturated tones, landscape 16:9'
  subject = title.gsub(/[",]/, '').gsub(/\s+/, ' ').strip
  # Strip common lead-ins that AI image models handle poorly
  subject = subject.sub(/^(why|how|the)\s+/i, '')
  "#{style}. Concept: #{subject}. No text, no letters, no faces. Cinematic composition."
end

def generate_image_bytes(prompt_text)
  uri = URI("https://fal.run/#{FAL_MODEL}")
  http = Net::HTTP.new(uri.host, uri.port); http.use_ssl = true; http.read_timeout = 90
  req = Net::HTTP::Post.new(uri)
  req['Authorization'] = "Key #{FAL_KEY}"
  req['Content-Type']  = 'application/json'
  req.body = {
    prompt: prompt_text,
    image_size: 'landscape_16_9',
    num_inference_steps: 4,
    num_images: 1,
    enable_safety_checker: true
  }.to_json
  res = http.request(req)
  raise "fal.ai #{res.code}: #{res.body[0, 300]}" unless res.code.to_i.between?(200, 299)
  url = JSON.parse(res.body).dig('images', 0, 'url')
  raise "fal.ai returned no image url" if url.nil? || url.empty?

  img_uri = URI(url)
  img_http = Net::HTTP.new(img_uri.host, img_uri.port); img_http.use_ssl = true; img_http.read_timeout = 60
  img_res = img_http.request(Net::HTTP::Get.new(img_uri))
  raise "image download #{img_res.code}" unless img_res.code.to_i.between?(200, 299)
  content_type = img_res['content-type'] || 'image/jpeg'
  ext = content_type.include?('png') ? 'png' : (content_type.include?('webp') ? 'webp' : 'jpg')
  { bytes: img_res.body, ext: ext }
end

def save_image_for_slug(slug, category, title)
  return nil unless FAL_KEY && !FAL_KEY.strip.empty?
  prompt_text = build_image_prompt(title, category)
  warn "  ▶ image prompt: #{prompt_text[0, 120]}"
  img = generate_image_bytes(prompt_text)
  FileUtils.mkdir_p(IMAGES_DIR)
  filename = "#{Time.now.utc.strftime('%Y-%m-%d')}-#{slug}.#{img[:ext]}"
  path = File.join(IMAGES_DIR, filename)
  File.binwrite(path, img[:bytes])
  warn "  ✓ image saved: #{path} (#{img[:bytes].bytesize} bytes)"
  "/#{path}"
rescue => e
  warn "  ✗ image generation failed (post will publish without image): #{e.message}"
  nil
end

MIN_WORDS = 1000  # hard floor — reject anything under this
MAX_ATTEMPTS = 3
RETRY_WAIT_SEC = 65  # gpt-oss-120b free-tier TPM is 8k/min; wait a full window before retry

def word_count(text) = text.to_s.split(/\s+/).size

def main
  category = weighted_pick
  warn "▶ Category: #{category}"

  payload = nil
  MAX_ATTEMPTS.times do |i|
    p = call_groq(prompt(category))
    wc = word_count(p['body'])
    warn "  Attempt #{i + 1}: #{wc} words"
    if wc >= MIN_WORDS
      payload = p
      break
    end
    warn "  ✗ Under #{MIN_WORDS} words — sleeping #{RETRY_WAIT_SEC}s then retrying"
    sleep RETRY_WAIT_SEC unless i == MAX_ATTEMPTS - 1
  end

  raise "Could not produce a body of #{MIN_WORDS}+ words after #{MAX_ATTEMPTS} attempts" if payload.nil?

  slug = slugify(payload.fetch('title'))
  image_url = save_image_for_slug(slug, category, payload.fetch('title'))
  path = write_post(payload, category, image_url: image_url)
  warn "✓ Wrote #{path} (#{word_count(payload['body'])} words, image: #{image_url ? 'yes' : 'no'})"
  puts path
end

main
