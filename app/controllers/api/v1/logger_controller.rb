class Api::V1::LoggerController < ApplicationController
  def index
    # render json: { session: session }
    render json: { message: "crap" }
  end
end
