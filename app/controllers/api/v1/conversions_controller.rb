class Api::V1::ConversionsController < ApplicationController
  protect_from_forgery with: :null_session # WARNING: disabling CSRF protection for file upload 

  require "shellwords"

  def docx_to_pdf
    return render json: { error: "No file uploaded" }, status: :bad_request unless params[:file]

    file = params[:file]

    unless valid_file?(file)
      return render json: { error: "Invalid file type" }, status: :unprocessable_entity
    end

    input_path = save_temp_file(file, ".docx")
    output_path = input_path.sub(/\.docx$/, ".pdf")

    conversion = "#{Shellwords.escape(input_path)} -f docx -t pdf -o #{Shellwords.escape(output_path)}"
    pdf_engine = "--pdf-engine=xelatex" # use xelatex to handle special UNICODE

    system(["pandoc", conversion, pdf_engine].join(" "))

    pdf = File.exist?(output_path) ? File.binread(output_path) : nil

    cleanup_files(input_path, output_path)

    render json: { pdf: Base64.encode64(pdf) }
  end

  # Converting doc to html, storing temp file of docx and media in temp folder before reading and return in response
  def docx_to_html
    return render json: { error: "No file uploaded" }, status: :bad_request unless params[:file]

    file = params[:file]

    unless valid_file?(file)
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

    html = File.exist?(output_path) ? File.read(output_path) : nil
    media = File.exist?(media_path) ? File.binread(media_path) : nil # IMPORTANT: Binary reading media zip file

    cleanup_files(input_path, output_path, media_path)

    render json: { html: html, media: media ? Base64.encode64(media) : nil }
  end

  private

  def valid_file?(file)
    allowed_types = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    allowed_types.include?(file.content_type)
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
