# Development-only identities. They are not Supabase credentials and are never loaded in production.
return unless Rails.env.development?

owner = User.find_or_create_by!(supabase_user_id: "00000000-0000-4000-8000-000000000001") do |user|
  user.email = "owner@example.invalid"
end
viewer = User.find_or_create_by!(supabase_user_id: "00000000-0000-4000-8000-000000000002") do |user|
  user.email = "viewer@example.invalid"
end
admin = User.find_or_create_by!(supabase_user_id: "00000000-0000-4000-8000-000000000003") do |user|
  user.email = "system-admin@example.invalid"
end

organization_a = Organization.find_or_create_by!(slug: "organization-a") { |org| org.name = "Organization A" }
Organization.find_or_create_by!(slug: "organization-b") { |org| org.name = "Organization B" }

OrganizationMembership.find_or_create_by!(organization: organization_a, user: owner) { |m| m.role = "owner" }
OrganizationMembership.find_or_create_by!(organization: organization_a, user: viewer) { |m| m.role = "viewer" }
organization_b = Organization.find_by!(slug: "organization-b")
OrganizationMembership.find_or_create_by!(organization: organization_b, user: viewer) do |membership|
  membership.role = "viewer"
  membership.status = "suspended"
end
SystemRole.find_or_create_by!(user: admin, role: "system_admin")
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
