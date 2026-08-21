require 'securerandom'
require 'json'
require 'date'
require_relative 'store'

module Schedules
  VALID_KINDS = %w[empty deep meetings admin focus].freeze
  VALID_DAYS  = %w[mon tue wed thu fri].freeze

  def self.upsert(user_id:, week_of:, cells:, rules:)
    week = parse_date(week_of) or return { ok: false, error: 'week_of must be an ISO date like 2026-08-10' }
    return { ok: false, error: 'cells must be an array' } unless cells.is_a?(Array)
    return { ok: false, error: 'too many cells' } if cells.length > 200

    clean_cells = cells.map do |c|
      next nil unless c.is_a?(Hash)
      day  = c['day'].to_s
      hour = c['hour'].to_i
      kind = c['kind'].to_s
      next nil unless VALID_DAYS.include?(day) && (9..16).cover?(hour) && VALID_KINDS.include?(kind)
      { 'day' => day, 'hour' => hour, 'kind' => kind }
    end.compact

    clean_rules = rules.is_a?(Hash) ? rules : {}
    now = Time.now.to_i

    existing = Store.conn.exec_params(
      'SELECT id, public_id FROM schedules WHERE user_id = $1 AND week_of = $2',
      [user_id, week.to_s]
    ).first

    if existing
      Store.conn.exec_params(
        'UPDATE schedules SET cells_json = $1, rules_json = $2, updated_at = $3 WHERE id = $4',
        [clean_cells.to_json, clean_rules.to_json, now, existing['id']]
      )
      { ok: true, id: existing['id'].to_i, public_id: existing['public_id'], saved_at: now }
    else
      public_id = SecureRandom.urlsafe_base64(12)
      row = Store.conn.exec_params(<<~SQL, [public_id, user_id, week.to_s, clean_cells.to_json, clean_rules.to_json, now]).first
        INSERT INTO schedules (public_id, user_id, week_of, cells_json, rules_json, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $6)
        RETURNING id
      SQL
      { ok: true, id: row['id'].to_i, public_id: public_id, saved_at: now }
    end
  end

  def self.mine(user_id:)
    Store.conn.exec_params(
      'SELECT public_id, week_of, cells_json, rules_json, updated_at FROM schedules WHERE user_id = $1 ORDER BY week_of DESC',
      [user_id]
    ).map { |r| serialize(r) }
  end

  def self.by_public_id(public_id)
    row = Store.conn.exec_params(
      'SELECT public_id, week_of, cells_json, rules_json, updated_at FROM schedules WHERE public_id = $1',
      [public_id]
    ).first
    row && serialize(row)
  end

  def self.serialize(r)
    {
      public_id: r['public_id'],
      week_of:   r['week_of'],
      cells:     JSON.parse(r['cells_json'] || '[]'),
      rules:     JSON.parse(r['rules_json'] || '{}'),
      updated_at: r['updated_at'].to_i
    }
  end

  def self.parse_date(s)
    Date.parse(s.to_s)
  rescue
    nil
  end
end
