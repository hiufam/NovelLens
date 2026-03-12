class Api::V1::DictionariesController < ApplicationController
  def get_images
    res = get_pexels_image({
      query: params[:query].strip,
      per_page: 10
    });
    
    data = JSON.parse(res.body) if res.is_a?(Net::HTTPSuccess)

    result = { 
      code: res.code,
      message: res.message
    }

    result[:data] = data if !data.nil?

    render json: result
  end

  def get_definitions
    res = get_dictonary_definitions(params[:query].strip);
    
    data = JSON.parse(res.body) if res.is_a?(Net::HTTPSuccess)

    result = { 
      code: res.code,
      message: res.message
    }

    result[:data] = data if !data.nil?

    render json: result
  end
  
  private
  
  def get_dictonary_definitions(query)
    dictionary_creds =  Rails.application.credentials.dictionary
    dictionary_uri = dictionary_creds[:api_url] + '/entries/en/' + query

    uri = URI(dictionary_uri)

    Net::HTTP.get_response(uri)
  end

  # https://www.pexels.com/api/documentation/#photos-search
  def get_pexels_image(params)
    pexels_creds =  Rails.application.credentials.pexels
    pexels_uri = pexels_creds[:api_url] + '/search'
    pexels_key = pexels_creds[:api_key]
    
    uri = URI(pexels_uri)
    uri.query = URI.encode_www_form(params)

    # From this stupid thing: 
    # https://ruby-doc.org/3.4.1/stdlibs/net/Net/HTTP.html#method-c-get_response
    Net::HTTP.get_response(uri, {
      'Authorization': pexels_key
    })
  end
end
