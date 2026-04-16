class Api::V1::BrowsesController < ApplicationController
  allow_unauthenticated_access

  def search_wiki
    res = wikipedia_search(params[:query].strip)

    data = JSON.parse(res.body) if res.is_a?(Net::HTTPSuccess)
    wiki_creds =  Rails.application.credentials.wiki

    result = {
      code: res.code,
      message: res.message
    }

    result[:data] = data if !data.nil?
    result[:data][:url] = wiki_creds[:api_url] + "/wiki/"

    render json: result
  end

  private

  # Source: https://www.mediawiki.org/wiki/API:Search
  def wikipedia_search(query)
    wiki_creds =  Rails.application.credentials.wiki
    wiki_uri = wiki_creds[:api_url] + "/w/api.php"

    uri = URI(wiki_uri)

    params = {
      action: "query",
      list: "search",
      srsearch: query,
      format: "json"
    }

    uri.query = URI.encode_www_form(params)

    response = Net::HTTP.get_response(uri)
  end
end
