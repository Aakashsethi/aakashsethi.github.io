require_relative 'store'
require 'digest'

module Limiter
  GROQ_GLOBAL_DAILY_MAX = ENV.fetch('GROQ_GLOBAL_DAILY_MAX', 200).to_i

  # Returns { ok: true, count:, remaining: } or { ok: false, reason: 'limit' | 'global_cap', remaining: 0 }
  def self.check_and_increment(subject_kind:, subject_key:, feature:, per_day_max:)
    day = Date.today
    conn = Store.conn

    row = conn.exec_params(<<~SQL, [subject_kind, subject_key, feature, day.to_s]).first
      INSERT INTO usage_counters (subject_kind, subject_key, feature, day, count)
      VALUES ($1, $2, $3, $4, 1)
      ON CONFLICT (subject_kind, subject_key, feature, day)
        DO UPDATE SET count = usage_counters.count + 1
      RETURNING count
    SQL

    count = row['count'].to_i
    if count > per_day_max
      # roll back the increment we just made so status is accurate
      conn.exec_params(<<~SQL, [subject_kind, subject_key, feature, day.to_s])
        UPDATE usage_counters SET count = count - 1
        WHERE subject_kind = $1 AND subject_key = $2 AND feature = $3 AND day = $4
      SQL
      return { ok: false, reason: 'limit', count: count - 1, remaining: 0 }
    end

    { ok: true, count: count, remaining: per_day_max - count }
  end

  # Peek without incrementing (for showing quota in UI).
  def self.remaining(subject_kind:, subject_key:, feature:, per_day_max:)
    row = Store.conn.exec_params(
      'SELECT count FROM usage_counters WHERE subject_kind=$1 AND subject_key=$2 AND feature=$3 AND day=$4',
      [subject_kind, subject_key, feature, Date.today.to_s]
    ).first
    used = row ? row['count'].to_i : 0
    [per_day_max - used, 0].max
  end

  # Global soft cap on Groq calls for the day.
  def self.groq_global_ok?
    row = Store.conn.exec_params(
      "SELECT COALESCE(SUM(count), 0) AS total FROM usage_counters WHERE feature='tailor' AND day=$1",
      [Date.today.to_s]
    ).first
    row['total'].to_i < GROQ_GLOBAL_DAILY_MAX
  end

  def self.hash(str)
    Digest::SHA256.hexdigest("v1:#{str.to_s}")[0, 32]
  end
end
