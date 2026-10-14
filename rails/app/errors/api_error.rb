class ApiError < StandardError
  attr_reader :code, :status, :details, :retryable

  def initialize(code:, message:, status:, details: {}, retryable: false)
    super(message)
    @code = code
    @status = status
    @details = details
    @retryable = retryable
  end
end

class UnauthenticatedError < ApiError
  def initialize
    super(code: "UNAUTHENTICATED", message: "Authentication is required.", status: :unauthorized)
  end
end

class InvalidTokenError < ApiError
  def initialize(code: "INVALID_TOKEN", message: "The access token is invalid.")
    super(code:, message:, status: :unauthorized)
  end
end

class TokenExpiredError < InvalidTokenError
  def initialize
    super(code: "TOKEN_EXPIRED", message: "The access token has expired.")
  end
end

class ForbiddenError < ApiError
  def initialize(code: "FORBIDDEN", message: "This action is not permitted.")
    super(code:, message:, status: :forbidden)
  end
end

class OrganizationNotFoundError < ApiError
  def initialize
    super(
      code: "ORGANIZATION_NOT_FOUND",
      message: "Organization was not found.",
      status: :not_found
    )
  end
end

class ServiceUnavailableError < ApiError
  def initialize(code: "SERVICE_UNAVAILABLE", message: "Authentication service is unavailable.")
    super(code:, message:, status: :service_unavailable, retryable: true)
  end
end
