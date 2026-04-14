#!/usr/bin/env bash
set -o errexit

yarn install
yarn build
yarn build:css

bundle install
bin/rails assets:precompile
bin/rails assets:clean

# For some fucking reason, Render decided not to run this piece of code
# So direct migrate from local console instead.
bin/rails db:migrate
