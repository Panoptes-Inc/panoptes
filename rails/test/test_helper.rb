ENV["RAILS_ENV"] = "test"
ENV["SUPABASE_JWT_ISSUER"] = "https://test.supabase.co/auth/v1"
ENV["SUPABASE_JWT_AUDIENCE"] = "authenticated"
ENV["SUPABASE_JWKS_URL"] = "https://test.supabase.co/auth/v1/.well-known/jwks.json"
ENV["SUPABASE_JWT_ALGORITHMS"] = "RS256"
require_relative "../config/environment"
require "rails/test_help"

Dir[Rails.root.join("test/support/**/*.rb")].sort.each { |file| require file }

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: 1)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    setup do
      Auth::JwksCache.reset!
      Rails.application.config.x.supabase_jwks_fetcher = -> { JwtFixture.jwks }
    end
  end
end
