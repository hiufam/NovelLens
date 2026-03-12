class Api::V1::LoggerController < ApplicationController
  def index
    # render json: { session: session }
    render json: { message: Rails.application.credentials.some_api_key! }
  end
end
