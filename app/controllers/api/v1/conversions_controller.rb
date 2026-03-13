# app/controllers/api/v1/conversions_controller.rb
class Api::V1::ConversionsController < ApplicationController
  protect_from_forgery with: :null_session # WARNING: disabling CSRF protection for file upload 

  require "shellwords"

  # Converting doc to html, storing temp file of docx and media in temp folder before reading and return in response
  def docx_to_html
    return render json: { error: "No file uploaded" }, status: :bad_request unless params[:file]

    file = params[:file]

    unless valid_docx?(file)
      return render json: { error: "Invalid file type" }, status: :unprocessable_entity
    end

    input_path = save_temp_file(file, ".docx")
    output_path = input_path.sub(/\.docx$/, ".html")
    media_path = Rails.root.join("tmp", "#{SecureRandom.uuid}.zip")
    pandoc_lua_scripts_path =  Rails.root.join("app", "pandoc", "scripts")

    conversion = "#{Shellwords.escape(input_path)} -f docx -t html -o #{Shellwords.escape(output_path)}"
    extract_media = "--extract-media=#{Shellwords.escape(media_path)}"
    lua_filter = "--lua-filter=#{Shellwords.escape(File.join(pandoc_lua_scripts_path, "image_filter.lua"))}"

    system(["pandoc", conversion, extract_media, lua_filter].join(" "))

    html = File.read(output_path)
    media = File.binread(media_path) # IMPORTANT: Binary reading media zip file

    cleanup_files(input_path, output_path, media_path)

    render json: { html: html, media: Base64.encode64(media) }
  end

  private

  def valid_docx?(file)
    file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  end

  def save_temp_file(file, ext)
    path = Rails.root.join("tmp", "#{SecureRandom.uuid}#{ext}")
    File.open(path, "wb") { |f| f.write(file.read) }
    path.to_s
  end

  def cleanup_files(*paths)
    paths.each { |path| File.delete(path) if File.exist?(path) }
  end
end
