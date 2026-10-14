class Organization < ApplicationRecord
  enum :status, { active: "active", suspended: "suspended" }, validate: true

  has_many :organization_memberships, dependent: :destroy
  has_many :users, through: :organization_memberships

  validates :name, presence: true, length: { maximum: 200 }
  validates :slug,
    presence: true,
    length: { maximum: 100 },
    format: { with: /\A[a-z0-9]+(?:-[a-z0-9]+)*\z/ },
    uniqueness: { case_sensitive: false }

  before_validation :normalize_slug

  private

  def normalize_slug
    self.slug = slug.to_s.strip.downcase
  end
end
