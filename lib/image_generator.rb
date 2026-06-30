require 'httparty'
require 'json'

module ImageGenerator
  FAL_MODEL = ENV.fetch('FAL_MODEL', 'fal-ai/flux/schnell')

  # Asks the LLM for a concise visual prompt for the given post.
  def self.prompt_from_post(post_body, category)
    system = <<~SYS
      You write image prompts for AI image generators. Output ONE concise prompt (under 40 words).
      Style: clean, editorial, slightly desaturated, warm tones. No text or letters in the image.
      No people's faces. Schematic / abstract / object-focused composition.
      Category: #{category}
    SYS
    user = "Post:\n#{post_body}\n\nReturn only the prompt, nothing else."

    api_key = ENV.fetch('GROQ_API_KEY')
    res = HTTParty.post(
      'https://api.groq.com/openai/v1/chat/completions',
      headers: { 'Authorization' => "Bearer #{api_key}", 'Content-Type' => 'application/json' },
      body: {
        model: ENV.fetch('GROQ_MODEL', 'llama-3.3-70b-versatile'),
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.6,
        max_tokens: 120
      }.to_json,
      timeout: 30
    )
    raise "Groq (image prompt) #{res.code}: #{res.body}" unless res.code == 200
    JSON.parse(res.body).dig('choices', 0, 'message', 'content').to_s.strip.gsub(/^["']|["']$/, '')
  end

  # Generates an image with fal.ai. Returns raw image bytes + content type.
  def self.generate(prompt)
    api_key = ENV.fetch('FAL_KEY')
    res = HTTParty.post(
      "https://fal.run/#{FAL_MODEL}",
      headers: {
        'Authorization' => "Key #{api_key}",
        'Content-Type' => 'application/json'
      },
      body: {
        prompt: prompt,
        image_size: 'landscape_4_3',
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true
      }.to_json,
      timeout: 60
    )
    raise "fal.ai #{res.code}: #{res.body}" unless res.code == 200
    image_url = JSON.parse(res.body).dig('images', 0, 'url') or raise "fal.ai no image: #{res.body}"

    img = HTTParty.get(image_url, timeout: 30)
    raise "fal.ai download #{img.code}" unless img.code == 200
    { bytes: img.body, content_type: img.headers['content-type'] || 'image/jpeg' }
  end
end
