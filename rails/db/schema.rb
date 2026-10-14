# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_08_07_000000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "organization_memberships", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.uuid "organization_id", null: false
    t.string "role", null: false
    t.string "status", default: "active", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["organization_id", "user_id"], name: "index_memberships_on_organization_and_user", unique: true
    t.index ["organization_id"], name: "index_organization_memberships_on_organization_id"
    t.index ["user_id"], name: "index_organization_memberships_on_user_id"
    t.check_constraint "role::text = ANY (ARRAY['owner'::character varying, 'organization_admin'::character varying, 'analyst'::character varying, 'project_manager'::character varying, 'viewer'::character varying, 'guest'::character varying]::text[])", name: "organization_memberships_role_allowed"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying, 'invited'::character varying, 'suspended'::character varying]::text[])", name: "organization_memberships_status_allowed"
  end

  create_table "organizations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "slug", null: false
    t.string "status", default: "active", null: false
    t.datetime "updated_at", null: false
    t.index "lower((slug)::text)", name: "index_organizations_on_lower_slug", unique: true
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying, 'suspended'::character varying]::text[])", name: "organizations_status_allowed"
  end

  create_table "system_roles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "role", null: false
    t.string "status", default: "active", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["user_id", "role"], name: "index_system_roles_on_user_id_and_role", unique: true
    t.index ["user_id"], name: "index_system_roles_on_user_id"
    t.check_constraint "role::text = 'system_admin'::text", name: "system_roles_role_allowed"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying, 'suspended'::character varying]::text[])", name: "system_roles_status_allowed"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email"
    t.datetime "last_authenticated_at"
    t.string "status", default: "active", null: false
    t.uuid "supabase_user_id", null: false
    t.datetime "updated_at", null: false
    t.index ["supabase_user_id"], name: "index_users_on_supabase_user_id", unique: true
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying, 'suspended'::character varying, 'deleted'::character varying]::text[])", name: "users_status_allowed"
  end

  add_foreign_key "organization_memberships", "organizations", on_delete: :cascade
  add_foreign_key "organization_memberships", "users", on_delete: :cascade
  add_foreign_key "system_roles", "users", on_delete: :cascade
end
