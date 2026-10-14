require "test_helper"

class Auth::SupabaseJwtVerifierTest < ActiveSupport::TestCase
  test "accepts a correctly signed token with required claims" do
    claims = verifier.verify(JwtFixture.token)
    assert_equal JwtFixture::SUBJECT, claims["sub"]
  end

  test "rejects expired, early, wrong issuer, and wrong audience tokens" do
    assert_raises(::TokenExpiredError) { verifier.verify(JwtFixture.token("exp" => 1)) }
    assert_raises(::InvalidTokenError) { verifier.verify(JwtFixture.token("nbf" => Time.now.to_i + 300)) }
    assert_raises(::InvalidTokenError) { verifier.verify(JwtFixture.token("iss" => "https://attacker.test")) }
    assert_raises(::InvalidTokenError) { verifier.verify(JwtFixture.token("aud" => "service_role")) }
  end

  test "rejects malformed, unsupported, unknown-key, and invalid-signature tokens" do
    assert_raises(::InvalidTokenError) { verifier.verify("not-a-jwt") }
    assert_raises(::InvalidTokenError) { verifier.verify(JwtFixture.token(algorithm: "HS256", key: "secret")) }
    assert_raises(::InvalidTokenError) { verifier.verify(JwtFixture.token(kid: "unknown")) }

    other_key = OpenSSL::PKey::RSA.generate(2048)
    assert_raises(::InvalidTokenError) { verifier.verify(JwtFixture.token(key: other_key)) }
  end

  test "refreshes JWKS once when a new kid appears" do
    rotated_key = OpenSSL::PKey::RSA.generate(2048)
    documents = [ JwtFixture.jwks, JwtFixture.jwks(key: rotated_key, kid: "rotated") ]
    fetcher = -> { documents.shift || documents.last }
    rotated_verifier = Auth::SupabaseJwtVerifier.new(jwks_fetcher: fetcher)

    assert_equal JwtFixture::SUBJECT,
      rotated_verifier.verify(JwtFixture.token(key: rotated_key, kid: "rotated"))["sub"]
  end

  test "reports JWKS outages as retryable service unavailability" do
    unavailable = Auth::SupabaseJwtVerifier.new(jwks_fetcher: -> { raise IOError })
    assert_raises(::ServiceUnavailableError) { unavailable.verify(JwtFixture.token) }
  end

  private

  def verifier
    Auth::SupabaseJwtVerifier.new
  end
end
