require "uri"

module Auth
  class SupabaseJwtConfiguration
    SUPPORTED_ALGORITHMS = %w[ES256 RS256].freeze

    attr_reader :issuer, :audience, :jwks_url, :algorithms, :cache_ttl, :stale_ttl

    def self.from_env!(environment = ENV)
      new(
        issuer: environment.fetch("SUPABASE_JWT_ISSUER"),
        audience: environment.fetch("SUPABASE_JWT_AUDIENCE"),
        jwks_url: environment.fetch("SUPABASE_JWKS_URL"),
        algorithms: environment.fetch("SUPABASE_JWT_ALGORITHMS", "ES256,RS256").split(","),
        cache_ttl: Integer(environment.fetch("SUPABASE_JWKS_CACHE_TTL_SECONDS", "300"), 10),
        stale_ttl: Integer(environment.fetch("SUPABASE_JWKS_STALE_TTL_SECONDS", "3600"), 10)
      )
    end

    def initialize(issuer:, audience:, jwks_url:, algorithms:, cache_ttl: 300, stale_ttl: 3600)
      @issuer = issuer.to_s.delete_suffix("/")
      @audience = audience.to_s
      @jwks_url = jwks_url.to_s
      @algorithms = algorithms.map(&:strip).intersection(SUPPORTED_ALGORITHMS).freeze
      @cache_ttl = cache_ttl
      @stale_ttl = stale_ttl
      validate!
    end

    private

    def validate!
      raise ArgumentError, "Supabase JWT issuer is required" if issuer.empty?
      raise ArgumentError, "Supabase JWT audience is required" if audience.empty?
      raise ArgumentError, "At least one supported JWT algorithm is required" if algorithms.empty?
      raise ArgumentError, "JWKS cache TTL must be positive" unless cache_ttl.positive?
      raise ArgumentError, "JWKS stale TTL must be at least the cache TTL" if stale_ttl < cache_ttl

      uri = URI.parse(jwks_url)
      unless uri.is_a?(URI::HTTPS) && uri.host.present? && uri.userinfo.nil?
        raise ArgumentError, "Supabase JWKS URL must be a fixed HTTPS URL without credentials"
      end
    rescue URI::InvalidURIError
      raise ArgumentError, "Supabase JWKS URL is invalid"
    end
  end
end
