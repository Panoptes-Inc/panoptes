require "jwt"
require "openssl"

module JwtFixture
  ISSUER = "https://test.supabase.co/auth/v1"
  AUDIENCE = "authenticated"
  SUBJECT = "11111111-1111-4111-8111-111111111111"
  KID = "test-key-1"

  module_function

  def private_key
    @private_key ||= OpenSSL::PKey::RSA.generate(2048)
  end

  def jwks(key: private_key, kid: KID)
    { "keys" => [ JSON.parse(JSON.generate(JWT::JWK.new(key.public_key, kid:).export)) ] }
  end

  def token(overrides = {}, key: private_key, kid: KID, algorithm: "RS256", **claim_overrides)
    now = Time.now.to_i
    claims = {
      "sub" => SUBJECT,
      "email" => "owner@example.test",
      "iss" => ISSUER,
      "aud" => AUDIENCE,
      "iat" => now,
      "nbf" => now - 1,
      "exp" => now + 300
    }.merge(overrides).merge(claim_overrides)
    JWT.encode(claims, key, algorithm, { kid: })
  end

  def authorization(overrides = {})
    { "Authorization" => "Bearer #{token(overrides)}" }
  end
end
