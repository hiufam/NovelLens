# app/controllers/api/v1/conversions_controller.rb
class Api::V1::ConversionsController < ApplicationController
  protect_from_forgery with: :null_session # WARNING: disabling CSRF protection for file upload 

  require "shellwords"

  def docx_to_html
    return render json: { error: "No file uploaded" }, status: :bad_request unless params[:file]

    file = params[:file]

    unless valid_docx?(file)
      return render json: { error: "Invalid file type" }, status: :unprocessable_entity
    end

    input_path = save_temp_file(file)
    output_path = input_path.sub(/\.docx$/, ".html")

    system("pandoc #{Shellwords.escape(input_path)} -f docx -t html -o #{Shellwords.escape(output_path)}")

    html = File.read(output_path)

    cleanup_files(input_path, output_path)

    render json: { html: html }
  end

  private

  def valid_docx?(file)
    file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  end

  def save_temp_file(file)
    path = Rails.root.join("tmp", "#{SecureRandom.uuid}.docx")
    File.open(path, "wb") { |f| f.write(file.read) }
    path.to_s
  end

  def cleanup_files(*paths)
    paths.each { |path| File.delete(path) if File.exist?(path) }
  end
end
