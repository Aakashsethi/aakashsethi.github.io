require 'rss'
require 'httparty'
require 'nokogiri'

module NewsSources
  FEEDS = {
    coding: [
      'https://hnrss.org/frontpage?points=200',
      'https://dev.to/feed',
      'https://github.blog/feed/'
    ],
    ai: [
      'https://techcrunch.com/category/artificial-intelligence/feed/',
      'https://www.anthropic.com/rss.xml',
      'https://openai.com/blog/rss.xml'
    ],
    industry: [
      'https://hbr.org/the-latest/feed',
      'https://www.mckinsey.com/insights/rss'
    ],
    stocks: [
      'https://feeds.marketwatch.com/marketwatch/topstories/',
      'https://feeds.content.dowjones.io/public/rss/mw_topstories'
    ]
  }.freeze

  def self.fetch(category)
    return [] if category == :education
    items = []
    FEEDS.fetch(category, []).each do |url|
      begin
        body = HTTParty.get(url, timeout: 8, headers: { 'User-Agent' => 'aakash-portfolio/1.0' }).body
        feed = RSS::Parser.parse(body, false)
        next unless feed
        feed.items.first(8).each do |item|
          items << {
            title: clean(item.respond_to?(:title) ? item.title.to_s : ''),
            url: item.respond_to?(:link) ? item.link.to_s : '',
            summary: clean(item.respond_to?(:description) ? item.description.to_s : ''),
            published: item.respond_to?(:pubDate) ? item.pubDate : nil
          }
        end
      rescue => e
        warn "[news_sources] #{category} #{url}: #{e.message}"
      end
    end
    items.reject { |i| i[:url].empty? || i[:title].empty? }
  end

  def self.clean(html)
    Nokogiri::HTML.fragment(html).text.strip.gsub(/\s+/, ' ')[0, 600]
  end
end
