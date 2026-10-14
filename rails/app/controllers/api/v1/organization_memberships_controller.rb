module Api
  module V1
    class OrganizationMembershipsController < ApplicationController
      include OrganizationAuthorization

      before_action :load_current_organization!

      def me
        render_success(data: {
          id: Current.membership.id,
          organization_id: Current.organization.id,
          user_id: Current.user.id,
          role: Current.membership.role,
          status: Current.membership.status
        })
      end
    end
  end
end
