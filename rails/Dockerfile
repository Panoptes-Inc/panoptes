# syntax=docker/dockerfile:1
FROM ruby:3.4.10-slim-bookworm

ENV BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH=/usr/local/bundle \
    RAILS_ENV=production

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential libpq-dev curl git && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1000 rails && \
    useradd --uid 1000 --gid 1000 --create-home --shell /bin/bash rails

WORKDIR /rails
COPY Gemfile Gemfile.lock ./
RUN bundle install
COPY . .

RUN chmod +x bin/docker-entrypoint bin/quality && chown -R rails:rails /rails
RUN bundle exec bootsnap precompile --gemfile app/ lib/

EXPOSE 3000
USER 1000:1000
ENTRYPOINT ["./bin/docker-entrypoint"]
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
