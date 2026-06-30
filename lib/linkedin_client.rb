require 'httparty'
require 'json'
require 'securerandom'
require_relative 'store'

module LinkedInClient
  AUTH_URL  = 'https://www.linkedin.com/oauth/v2/authorization'
  TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
  USERINFO_URL = 'https://api.linkedin.com/v2/userinfo'
  UGC_URL   = 'https://api.linkedin.com/v2/ugcPosts'

  SCOPES = 'openid profile w_member_social'

  def self.authorize_url(state)
    params = {
      response_type: 'code',
      client_id: ENV.fetch('LINKEDIN_CLIENT_ID'),
      redirect_uri: ENV.fetch('LINKEDIN_REDIRECT_URI'),
      state: state,
      scope: SCOPES
    }
    "#{AUTH_URL}?#{URI.encode_www_form(params)}"
  end

  def self.exchange_code(code)
    res = HTTParty.post(TOKEN_URL, body: {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: ENV.fetch('LINKEDIN_REDIRECT_URI'),
      client_id: ENV.fetch('LINKEDIN_CLIENT_ID'),
      client_secret: ENV.fetch('LINKEDIN_CLIENT_SECRET')
    }, timeout: 30)
    raise "Token exchange failed #{res.code}: #{res.body}" unless res.code == 200
    JSON.parse(res.body)
  end

  def self.refresh!(refresh_token)
    res = HTTParty.post(TOKEN_URL, body: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
      client_id: ENV.fetch('LINKEDIN_CLIENT_ID'),
      client_secret: ENV.fetch('LINKEDIN_CLIENT_SECRET')
    }, timeout: 30)
    raise "Refresh failed #{res.code}: #{res.body}" unless res.code == 200
    JSON.parse(res.body)
  end

  def self.userinfo(access_token)
    res = HTTParty.get(USERINFO_URL, headers: { 'Authorization' => "Bearer #{access_token}" }, timeout: 15)
    raise "userinfo #{res.code}: #{res.body}" unless res.code == 200
    JSON.parse(res.body)
  end

  def self.ensure_fresh_token
    tok = Store.token or raise 'No LinkedIn token stored. Run OAuth flow first.'
    if tok['access_expires_at'] - Time.now.to_i < 60 * 60 * 24
      raise 'Refresh token missing.' unless tok['refresh_token']
      refreshed = refresh!(tok['refresh_token'])
      Store.save_token(
        access: refreshed['access_token'],
        refresh: refreshed['refresh_token'],
        access_expires_in: refreshed['expires_in'].to_i,
        refresh_expires_in: refreshed['refresh_token_expires_in']&.to_i,
        person_urn: tok['person_urn']
      )
      tok = Store.token
    end
    tok
  end

  def self.post_text(body)
    tok = ensure_fresh_token
    person_urn = tok['person_urn']
    payload = {
      author: "urn:li:person:#{person_urn}",
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent' => {
          shareCommentary: { text: body },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC' }
    }
    res = HTTParty.post(UGC_URL,
      headers: {
        'Authorization' => "Bearer #{tok['access_token']}",
        'Content-Type' => 'application/json',
        'X-Restli-Protocol-Version' => '2.0.0'
      },
      body: payload.to_json,
      timeout: 30
    )
    raise "UGC post failed #{res.code}: #{res.body}" unless [200, 201].include?(res.code)
    res.headers['x-restli-id'] || JSON.parse(res.body)['id']
  end
end
