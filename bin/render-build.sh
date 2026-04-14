#!/usr/bin/env bash
set -o errexit

yarn install
yarn build
yarn build:css

bundle install
bundle exec rake assets:precompile
bundle exec rake assets:clean
bundle exec rake db:migrate
