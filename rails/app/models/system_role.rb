class SystemRole < ApplicationRecord
  belongs_to :user

  enum :role, { system_admin: "system_admin" }, validate: true
  enum :status, { active: "active", suspended: "suspended" }, validate: true

  validates :role, uniqueness: { scope: :user_id }
end
