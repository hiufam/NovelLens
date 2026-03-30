# Taken from: https://github.com/nickjj/docker-rails-example/blob/main/Dockerfile

# syntax=docker/dockerfile:1
# check=error=true

# This Dockerfile is designed for production, not development. Use with Kamal or build'n'run by hand:
# docker build -t novel .
# docker run -d -p 80:80 -e RAILS_MASTER_KEY=<value from config/master.key> --name novel novel

# For a containerized dev environment, see Dev Containers: https://guides.rubyonrails.org/getting_started_with_devcontainer.html

# Make sure RUBY_VERSION matches the Ruby version in .ruby-version
ARG RUBY_VERSION=3.4.7
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS assets

WORKDIR /app

ARG APP_UID=1000
ARG APP_GID=1000

RUN bash -c "set -o pipefail && apt-get update \
  && apt-get install -y --no-install-recommends build-essential curl git libpq-dev libyaml-dev \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key -o /etc/apt/keyrings/nodesource.asc \
  && echo 'deb [signed-by=/etc/apt/keyrings/nodesource.asc] https://deb.nodesource.com/node_24.x nodistro main' | tee /etc/apt/sources.list.d/nodesource.list \
  && apt-get update && apt-get install -y --no-install-recommends nodejs \
  && corepack enable \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
  && apt-get clean \
  && groupadd -g \"${APP_GID}\" ruby \
  && useradd --create-home --no-log-init -u \"${APP_UID}\" -g \"${APP_GID}\" ruby \
  && mkdir /node_modules && chown ruby:ruby -R /node_modules /app"

USER ruby

COPY --chown=ruby:ruby Gemfile* ./
RUN bundle install

COPY --chown=ruby:ruby package.json *yarn* ./
RUN yarn install

ARG RAILS_ENV="production"
ARG NODE_ENV="production"
ENV RAILS_ENV="${RAILS_ENV}" \
  NODE_ENV="${NODE_ENV}" \
  PATH="${PATH}:/home/ruby/.local/bin:/node_modules/.bin" \
  USER="ruby"

COPY --chown=ruby:ruby . .

RUN if [ "${RAILS_ENV}" != "development" ]; then \
  SECRET_KEY_BASE_DUMMY=1 rails assets:precompile; fi

CMD ["bash"]

# Final stage for app image
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS app

WORKDIR /app

ARG APP_UID=1000
ARG APP_GID=1000

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl libpq-dev dos2unix \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
  && apt-get clean \
  && groupadd -g "${APP_GID}" ruby \
  && useradd --create-home --no-log-init -u "${APP_UID}" -g "${APP_GID}" ruby \
  && chown ruby:ruby -R /app

# Fix line ending when executing bash command
# Source: https://willi.am/blog/2016/08/11/docker-for-windows-dealing-with-windows-line-endings/
COPY /bin/docker-entrypoint-web.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN apt-get --purge remove -y dos2unix

USER ruby

COPY --chown=ruby:ruby bin/ ./bin
RUN chmod 0755 bin/*

ARG RAILS_ENV="production"
ENV RAILS_ENV="${RAILS_ENV}" \
  PATH="${PATH}:/home/ruby/.local/bin" \
  USER="ruby"

COPY --chown=ruby:ruby --from=assets /usr/local/bundle /usr/local/bundle
COPY --chown=ruby:ruby --from=assets /app/public /public
COPY --chown=ruby:ruby . .

# ENTRYPOINT ["/app/bin/docker-entrypoint-web.sh"]
ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 8000

CMD ["rails", "s"]
