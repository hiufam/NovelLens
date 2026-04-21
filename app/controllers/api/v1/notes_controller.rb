class Api::V1::NotesController < ApplicationController
  allow_unauthenticated_access

  def index
  end

  def create
    if !Current.session.present?
      return render json: { error: "Must sign in to save note" }, status: :unauthorized
    end

    permitted = params.permit(:title, :content)

    @user = Current.user
    @note = @user.notes.new(permitted)

    if @note.save
      render json: @note, status: :created
    else
      render json: { error: "Something went wrong" }, status: :unprocessable_entity
    end
  end
end
