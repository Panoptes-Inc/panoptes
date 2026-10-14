require "test_helper"
require "yaml"

class OpenapiContractTest < ActiveSupport::TestCase
  IMPLEMENTED_GET_PATHS = {
    "/health" => "api/v1/health",
    "/me" => "api/v1/me",
    "/organizations" => "api/v1/organizations",
    "/organizations/{organization_id}" => "api/v1/organizations",
    "/organizations/{organization_id}/memberships/me" => "api/v1/organization_memberships"
  }.freeze

  test "implemented Rails reads are represented by the shared OpenAPI contract" do
    document = YAML.safe_load_file(Rails.root.join("../docs/api/openapi-draft.yaml"))

    IMPLEMENTED_GET_PATHS.each do |contract_path, controller|
      assert document.fetch("paths").dig(contract_path, "get", "operationId").present?

      rails_path = "/api/v1#{contract_path}".gsub(
        "{organization_id}",
        "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa"
      )
      route = Rails.application.routes.recognize_path(rails_path, method: :get)
      assert_equal controller, route.fetch(:controller)
    end
  end
end
