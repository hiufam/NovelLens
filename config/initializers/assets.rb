# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = "1.0"

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path
# https://stackoverflow.com/questions/70526113/how-to-use-bootstrap-icons-with-rails-7-0
Rails.application.config.assets.paths << Rails.root.join("node_modules/bootstrap-icons/font")
