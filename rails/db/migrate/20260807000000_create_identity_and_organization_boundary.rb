class CreateIdentityAndOrganizationBoundary < ActiveRecord::Migration[8.1]
  def change
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")

    create_table :users, id: :uuid do |t|
      t.uuid :supabase_user_id, null: false
      t.string :email
      t.string :status, null: false, default: "active"
      t.datetime :last_authenticated_at
      t.timestamps
    end
    add_index :users, :supabase_user_id, unique: true
    add_check_constraint :users,
      "status IN ('active', 'suspended', 'deleted')",
      name: "users_status_allowed"

    create_table :organizations, id: :uuid do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.string :status, null: false, default: "active"
      t.timestamps
    end
    add_index :organizations, "lower(slug)", unique: true, name: "index_organizations_on_lower_slug"
    add_check_constraint :organizations,
      "status IN ('active', 'suspended')",
      name: "organizations_status_allowed"

    create_table :organization_memberships, id: :uuid do |t|
      t.references :organization, null: false, type: :uuid, foreign_key: { on_delete: :cascade }
      t.references :user, null: false, type: :uuid, foreign_key: { on_delete: :cascade }
      t.string :role, null: false
      t.string :status, null: false, default: "active"
      t.timestamps
    end
    add_index :organization_memberships,
      %i[organization_id user_id],
      unique: true,
      name: "index_memberships_on_organization_and_user"
    add_check_constraint :organization_memberships,
      "role IN ('owner', 'organization_admin', 'analyst', 'project_manager', 'viewer', 'guest')",
      name: "organization_memberships_role_allowed"
    add_check_constraint :organization_memberships,
      "status IN ('active', 'invited', 'suspended')",
      name: "organization_memberships_status_allowed"

    create_table :system_roles, id: :uuid do |t|
      t.references :user, null: false, type: :uuid, foreign_key: { on_delete: :cascade }
      t.string :role, null: false
      t.string :status, null: false, default: "active"
      t.timestamps
    end
    add_index :system_roles, %i[user_id role], unique: true
    add_check_constraint :system_roles,
      "role IN ('system_admin')",
      name: "system_roles_role_allowed"
    add_check_constraint :system_roles,
      "status IN ('active', 'suspended')",
      name: "system_roles_status_allowed"
  end
end
