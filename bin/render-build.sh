#!/usr/bin/env bash
set -o errexit

echo "Build started"
echo "RAILS_ENV=$RAILS_ENV"
echo "DATABASE_URL set? ${DATABASE_URL:+yes}"

echo "Installing JS dependencies"
yarn install

echo "Building JS"
yarn build

echo "Building CSS"
yarn build:css

echo "Installing gems"
bundle install

echo "Precompiling assets"
bin/rails assets:precompile

echo "Cleaning assets"
bin/rails assets:clean

echo "Checking DB connection"
bin/rails runner "
begin
  ActiveRecord::Base.connection.execute('SELECT 1')
  puts 'DB connection OK'
rescue => e
  puts 'DB connection FAILED'
  puts e.message
end
"

echo "Running migrations"
RAILS_ENV=production bin/rails db:migrate

echo "Migration status"
RAILS_ENV=production bin/rails db:migrate:status

echo "Build finished"
