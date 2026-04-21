class Api::V1::NotesController < ApplicationController
  allow_unauthenticated_access

  def index
    if !Current.session.present?
      return render json: { error: "Unauthorized" }, status: :unauthorized
    end

    permitted = params.permit(:limit, :offset)

    limit = (permitted[:limit] ||= 10).to_i
    offset = (permitted[:offset] ||= 0).to_i

    @user = Current.user

    base_query = Note.where(user_id: @user.id)

    total = base_query.count
    notes = base_query.limit(limit).offset(limit * offset)

    render json: {
      records: notes,
      limit: limit,
      offset: offset,
      total: total
    }
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
