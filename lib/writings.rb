require 'yaml'
require 'date'

module Writings
  DIR = File.expand_path('../content/posts', __dir__)

  def self.all
    @cache = nil if ENV['WRITINGS_NO_CACHE']
    @cache ||= load_all
  end

  def self.by_slug(slug)
    all.find { |w| w[:slug] == slug }
  end

  def self.load_all
    return [] unless Dir.exist?(DIR)
    Dir.glob(File.join(DIR, '*.md')).map { |path| parse(path) }.compact.sort_by { |w| w[:date] }.reverse
  end

  def self.parse(path)
    raw = File.read(path)
    if raw.start_with?("---\n")
      _, fm_yaml, body = raw.split(/^---\s*$\n/, 3)
      meta = YAML.safe_load(fm_yaml, permitted_classes: [Date, Time]) || {}
    else
      meta = {}
      body = raw
    end

    filename = File.basename(path, '.md')
    slug_from_name = filename.sub(/^\d{4}-\d{2}-\d{2}-/, '')
    date_from_name = filename[/^\d{4}-\d{2}-\d{2}/]

    {
      slug:    (meta['slug']    || slug_from_name).to_s,
      title:   (meta['title']   || slug_from_name.tr('-', ' ')).to_s,
      summary: meta['excerpt']  || meta['summary'],
      category: meta['category'],
      tags:    Array(meta['tags']),
      date:    (meta['date']&.to_s || date_from_name || '1970-01-01'),
      body_md: body.to_s.strip
    }
  rescue => e
    warn "[writings] failed to parse #{path}: #{e.message}"
    nil
  end
end
