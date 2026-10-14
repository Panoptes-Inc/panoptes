require "jwt"
require "openssl"

module Auth
  class SupabaseJwtVerifier
    MAX_TOKEN_BYTES = 16_384
    SUBJECT_PATTERN = /\A[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\z/i

    def initialize(
      configuration: SupabaseJwtConfiguration.from_env!,
      jwks_fetcher: Rails.application.config.x.supabase_jwks_fetcher
    )
      @configuration = configuration
      @jwks_fetcher = jwks_fetcher
    end

    def verify(token)
      raise InvalidTokenError.new unless token.is_a?(String) && token.bytesize.between?(1, MAX_TOKEN_BYTES)

      header = JWT.decode(token, nil, false).last
      algorithm = header["alg"]
      kid = header["kid"]
      unless @configuration.algorithms.include?(algorithm) &&
          kid.is_a?(String) && /\A[A-Za-z0-9._:-]{1,128}\z/.match?(kid)
        raise InvalidTokenError.new
      end

      jwk = JwksCache.key_for(@configuration, kid, fetcher: @jwks_fetcher)
      public_key = JWT::JWK.import(jwk).public_key
      claims, = JWT.decode(
        token,
        public_key,
        true,
        algorithm:,
        iss: @configuration.issuer,
        verify_iss: true,
        aud: @configuration.audience,
        verify_aud: true,
        verify_expiration: true,
        verify_not_before: true,
        required_claims: %w[sub exp iss aud]
      )

      raise InvalidTokenError.new unless SUBJECT_PATTERN.match?(claims["sub"].to_s)

      claims
    rescue JWT::ExpiredSignature
      raise TokenExpiredError.new
    rescue JWT::DecodeError, JWT::JWKError, OpenSSL::PKey::PKeyError
      raise InvalidTokenError.new
    end
  end
end
