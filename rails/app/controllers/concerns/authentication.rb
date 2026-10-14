module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_request!
  end

  private

  def authenticate_request!
    authorization = request.authorization
    raise UnauthenticatedError.new if authorization.blank?

    match = /\ABearer ([^\s]+)\z/.match(authorization)
    raise InvalidTokenError.new unless match

    claims = Auth::SupabaseJwtVerifier.new.verify(match[1])
    Current.user = Auth::UserMapper.call(claims)
  end
end
