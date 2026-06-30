require 'sqlite3'
require 'json'

module Store
  DB_PATH = ENV.fetch('DB_PATH', File.join(Dir.pwd, 'portfolio.sqlite3'))

  def self.db
    @db ||= begin
      d = SQLite3::Database.new(DB_PATH)
      d.results_as_hash = true
      d.execute <<~SQL
        CREATE TABLE IF NOT EXISTS linkedin_token (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          access_expires_at INTEGER NOT NULL,
          refresh_expires_at INTEGER,
          person_urn TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        )
      SQL
      d.execute <<~SQL
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL,
          source_url TEXT,
          source_title TEXT,
          body TEXT NOT NULL,
          linkedin_urn TEXT,
          posted_at INTEGER NOT NULL,
          error TEXT
        )
      SQL
      d
    end
  end

  def self.save_token(access:, refresh:, access_expires_in:, refresh_expires_in:, person_urn:)
    now = Time.now.to_i
    db.execute(
      'INSERT INTO linkedin_token (id, access_token, refresh_token, access_expires_at, refresh_expires_at, person_urn, updated_at)
       VALUES (1, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         access_token=excluded.access_token,
         refresh_token=COALESCE(excluded.refresh_token, linkedin_token.refresh_token),
         access_expires_at=excluded.access_expires_at,
         refresh_expires_at=COALESCE(excluded.refresh_expires_at, linkedin_token.refresh_expires_at),
         person_urn=excluded.person_urn,
         updated_at=excluded.updated_at',
      [access, refresh, now + access_expires_in, refresh_expires_in ? now + refresh_expires_in : nil, person_urn, now]
    )
  end

  def self.token
    db.get_first_row('SELECT * FROM linkedin_token WHERE id = 1')
  end

  def self.record_post(category:, source_url:, source_title:, body:, urn:, error: nil)
    db.execute(
      'INSERT INTO posts (category, source_url, source_title, body, linkedin_urn, posted_at, error) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [category.to_s, source_url, source_title, body, urn, Time.now.to_i, error]
    )
  end

  def self.recent_source_urls(days: 30)
    cutoff = Time.now.to_i - days * 86_400
    db.execute('SELECT source_url FROM posts WHERE posted_at > ? AND source_url IS NOT NULL', [cutoff])
      .map { |r| r['source_url'] }
  end

  def self.recent_posts(limit: 10)
    db.execute('SELECT * FROM posts ORDER BY posted_at DESC LIMIT ?', [limit])
  end
end
