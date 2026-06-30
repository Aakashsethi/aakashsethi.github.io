require 'pg'
require 'json'
require 'uri'

module Store
  def self.conn
    @conn = nil if @conn && @conn.finished?
    @conn ||= begin
      url = ENV.fetch('DATABASE_URL')
      c = PG.connect(url)
      init_schema(c)
      c
    end
  end

  def self.init_schema(c)
    c.exec <<~SQL
      CREATE TABLE IF NOT EXISTS linkedin_token (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        access_expires_at BIGINT NOT NULL,
        refresh_expires_at BIGINT,
        person_urn TEXT NOT NULL,
        updated_at BIGINT NOT NULL
      )
    SQL
    c.exec <<~SQL
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        source_url TEXT,
        source_title TEXT,
        body TEXT NOT NULL,
        linkedin_urn TEXT,
        posted_at BIGINT NOT NULL,
        error TEXT
      )
    SQL
    c.exec <<~SQL
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        summary TEXT,
        body_md TEXT NOT NULL,
        category TEXT NOT NULL,
        sources_json TEXT,
        created_at BIGINT NOT NULL
      )
    SQL
  end

  def self.save_blog(slug:, title:, summary:, body_md:, category:, sources:)
    conn.exec_params(
      'INSERT INTO blog_posts (slug, title, summary, body_md, category, sources_json, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (slug) DO NOTHING',
      [slug, title, summary, body_md, category.to_s, sources.to_json, Time.now.to_i]
    )
  end

  def self.recent_blog(limit: 20)
    conn.exec_params('SELECT slug, title, summary, category, created_at FROM blog_posts ORDER BY created_at DESC LIMIT $1', [limit]).to_a
  end

  def self.blog_by_slug(slug)
    conn.exec_params('SELECT * FROM blog_posts WHERE slug = $1', [slug]).first
  end

  def self.recent_blog_source_urls(days: 60)
    cutoff = Time.now.to_i - days * 86_400
    rows = conn.exec_params('SELECT sources_json FROM blog_posts WHERE created_at > $1', [cutoff])
    rows.flat_map { |r| JSON.parse(r['sources_json'] || '[]').map { |s| s['url'] } }.compact
  end

  def self.save_token(access:, refresh:, access_expires_in:, refresh_expires_in:, person_urn:)
    now = Time.now.to_i
    conn.exec_params(<<~SQL, [access, refresh, now + access_expires_in, refresh_expires_in ? now + refresh_expires_in : nil, person_urn, now])
      INSERT INTO linkedin_token (id, access_token, refresh_token, access_expires_at, refresh_expires_at, person_urn, updated_at)
      VALUES (1, $1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = COALESCE(EXCLUDED.refresh_token, linkedin_token.refresh_token),
        access_expires_at = EXCLUDED.access_expires_at,
        refresh_expires_at = COALESCE(EXCLUDED.refresh_expires_at, linkedin_token.refresh_expires_at),
        person_urn = EXCLUDED.person_urn,
        updated_at = EXCLUDED.updated_at
    SQL
  end

  def self.token
    row = conn.exec('SELECT * FROM linkedin_token WHERE id = 1').first
    return nil unless row
    row.transform_values { |v| v.is_a?(String) && v.match?(/\A-?\d+\z/) ? v.to_i : v }
  end

  def self.record_post(category:, source_url:, source_title:, body:, urn:, error: nil)
    conn.exec_params(
      'INSERT INTO posts (category, source_url, source_title, body, linkedin_urn, posted_at, error) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [category.to_s, source_url, source_title, body, urn, Time.now.to_i, error]
    )
  end

  def self.recent_source_urls(days: 30)
    cutoff = Time.now.to_i - days * 86_400
    conn.exec_params(
      'SELECT source_url FROM posts WHERE posted_at > $1 AND source_url IS NOT NULL',
      [cutoff]
    ).map { |r| r['source_url'] }
  end

  def self.recent_posts(limit: 10)
    conn.exec_params('SELECT * FROM posts ORDER BY posted_at DESC LIMIT $1', [limit]).to_a
  end
end
