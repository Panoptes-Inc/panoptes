module OrganizationAuthorization
  extend ActiveSupport::Concern

  private

  def load_current_organization!(required_roles: nil)
    membership = Current.user.organization_memberships.active
      .joins(:organization)
      .merge(Organization.active)
      .includes(:organization)
      .find_by(organization_id: params.require(:organization_id))
    raise OrganizationNotFoundError.new unless membership
    raise ForbiddenError.new if required_roles && !required_roles.include?(membership.role)

    Current.organization = membership.organization
    Current.membership = membership
  end
end
