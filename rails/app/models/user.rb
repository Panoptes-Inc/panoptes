class User < ApplicationRecord
  enum :status, { active: "active", suspended: "suspended", deleted: "deleted" }, validate: true

  has_many :organization_memberships, dependent: :destroy
  has_many :organizations, through: :organization_memberships
  has_many :system_roles, dependent: :destroy

  validates :supabase_user_id, presence: true, uniqueness: true
  validates :email, length: { maximum: 320 }, allow_nil: true

  def system_admin?
    system_roles.active.system_admin.exists?
  end
end
