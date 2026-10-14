require "test_helper"

class ApiV1BoundaryTest < ActionDispatch::IntegrationTest
  test "health is public and returns request metadata" do
    get "/api/v1/health", headers: { "X-Request-ID" => "request-test-123" }

    assert_response :ok
    assert_equal "ok", response.parsed_body.dig("data", "status")
    assert_equal "request-test-123", response.parsed_body.dig("meta", "request_id")
  end

  test "me requires bearer authentication and uses the Supabase UUID mapping" do
    get "/api/v1/me"
    assert_error :unauthorized, "UNAUTHENTICATED"

    get "/api/v1/me", headers: { "Authorization" => "Basic invalid" }
    assert_error :unauthorized, "INVALID_TOKEN"

    get "/api/v1/me", headers: JwtFixture.authorization
    assert_response :ok
    assert_equal JwtFixture::SUBJECT, response.parsed_body.dig("data", "supabase_user_id")
    assert_equal true, response.parsed_body.dig("data", "system_admin")
    assert_equal "private, no-store", response.headers["Cache-Control"]
  end

  test "organization index returns only active memberships and organizations" do
    get "/api/v1/organizations", headers: JwtFixture.authorization

    assert_response :ok
    assert_equal [ organizations(:alpha).id ], response.parsed_body["data"].pluck("id")
  end

  test "unaffiliated users receive an empty organization collection" do
    headers = JwtFixture.authorization(
      "sub" => users(:outsider).supabase_user_id,
      "email" => users(:outsider).email
    )
    get "/api/v1/organizations", headers: headers

    assert_response :ok
    assert_empty response.parsed_body["data"]
  end

  test "organization show hides non-membership and suspended organizations" do
    get "/api/v1/organizations/#{organizations(:alpha).id}", headers: JwtFixture.authorization
    assert_response :ok
    assert_equal "owner", response.parsed_body.dig("data", "membership", "role")

    get "/api/v1/organizations/#{organizations(:beta).id}", headers: JwtFixture.authorization
    assert_error :not_found, "ORGANIZATION_NOT_FOUND"

    get "/api/v1/organizations/#{organizations(:suspended).id}", headers: JwtFixture.authorization
    assert_error :not_found, "ORGANIZATION_NOT_FOUND"
  end

  test "guest membership is visible to self but cannot read organization details" do
    headers = JwtFixture.authorization("sub" => users(:guest).supabase_user_id, "email" => users(:guest).email)

    get "/api/v1/organizations/#{organizations(:alpha).id}/memberships/me", headers: headers
    assert_response :ok
    assert_equal "guest", response.parsed_body.dig("data", "role")

    get "/api/v1/organizations/#{organizations(:alpha).id}", headers: headers
    assert_error :forbidden, "FORBIDDEN"
  end

  test "suspended users and memberships are denied" do
    suspended_user_headers = JwtFixture.authorization(
      "sub" => users(:suspended).supabase_user_id,
      "email" => users(:suspended).email
    )
    get "/api/v1/me", headers: suspended_user_headers
    assert_error :forbidden, "FORBIDDEN"

    suspended_membership_headers = JwtFixture.authorization(
      "sub" => users(:viewer).supabase_user_id,
      "email" => users(:viewer).email
    )
    get "/api/v1/organizations/#{organizations(:beta).id}", headers: suspended_membership_headers
    assert_error :not_found, "ORGANIZATION_NOT_FOUND"
  end

  test "request identifiers are sanitized and correlation is propagated" do
    get "/api/v1/me", headers: JwtFixture.authorization.merge(
      "X-Request-ID" => "bad value",
      "X-Correlation-ID" => "correlation-123"
    )

    assert_response :ok
    refute_equal "bad value", response.headers["X-Request-ID"]
    assert_equal "correlation-123", response.headers["X-Correlation-ID"]
  end

  private

  def assert_error(status, code)
    assert_response status
    assert_equal code, response.parsed_body.dig("error", "code")
    assert response.parsed_body.dig("meta", "request_id").present?
  end
end
