module Api
  module V1
    class OrganizationsController < ApplicationController
      include OrganizationAuthorization

      before_action -> { load_current_organization!(required_roles: OrganizationMembership::ORGANIZATION_READ_ROLES) }, only: :show

      def index
        memberships = Current.user.organization_memberships.active
          .joins(:organization)
          .merge(Organization.active)
          .includes(:organization)
          .order("organizations.name ASC")

        render_success(data: memberships.map { |membership| organization_json(membership) })
      end

      def show
        render_success(data: organization_json(Current.membership))
      end

      private

      def organization_json(membership)
        organization = membership.organization
        {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          status: organization.status,
          membership: {
            id: membership.id,
            role: membership.role,
            status: membership.status
          }
        }
      end
    end
  end
end
