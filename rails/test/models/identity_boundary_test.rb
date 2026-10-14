require "test_helper"

class IdentityBoundaryTest < ActiveSupport::TestCase
  test "user identity is keyed by Supabase UUID rather than email" do
    mapped = Auth::UserMapper.call(
      "sub" => users(:owner).supabase_user_id,
      "email" => "changed@example.test"
    )

    assert_equal users(:owner).id, mapped.id
    assert_equal "changed@example.test", mapped.email
    assert_equal 5, User.count
  end

  test "first verified subject provisions one local user without using email as identity" do
    subject = "66666666-6666-4666-8666-666666666666"
    assert_difference("User.count", 1) do
      mapped = Auth::UserMapper.call("sub" => subject, "email" => users(:owner).email)
      assert_equal subject, mapped.supabase_user_id
      refute_equal users(:owner).id, mapped.id
    end
  end

  test "organization roles and statuses reject unsupported values" do
    membership = organization_memberships(:owner_alpha)
    membership.role = "superuser"
    assert_not membership.valid?

    organization = organizations(:alpha)
    organization.status = "deleted"
    assert_not organization.valid?
  end


  test "organization read roles cover all active roles except guest" do
    assert_equal %w[owner organization_admin analyst project_manager viewer],
      OrganizationMembership::ORGANIZATION_READ_ROLES
  end
end
