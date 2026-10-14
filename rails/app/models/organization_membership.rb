class OrganizationMembership < ApplicationRecord
  ROLES = %w[owner organization_admin analyst project_manager viewer guest].freeze
  ORGANIZATION_READ_ROLES = (ROLES - [ "guest" ]).freeze

  belongs_to :organization
  belongs_to :user

  enum :role, ROLES.index_with(&:itself), validate: true
  enum :status, { active: "active", invited: "invited", suspended: "suspended" }, validate: true

  validates :user_id, uniqueness: { scope: :organization_id }
end
