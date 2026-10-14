class ApplicationController < ActionController::API
  include Authentication

  before_action :set_request_context
  after_action :prevent_authenticated_response_caching

  rescue_from StandardError, with: :render_internal_error
  rescue_from ActiveRecord::RecordInvalid, with: :render_record_invalid
  rescue_from ActionController::ParameterMissing, with: :render_bad_request
  rescue_from ApiError, with: :render_api_error

  private

  def set_request_context
    Current.request_id = request.request_id
    Current.correlation_id = request.env["panoptes.correlation_id"]
  end

  def render_success(data:, status: :ok, meta: {})
    render json: { data:, meta: response_meta.merge(meta) }, status:
  end

  def render_api_error(error)
    render json: {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        retryable: error.retryable
      },
      meta: response_meta
    }, status: error.status
  end

  def render_bad_request(error)
    render_api_error(ApiError.new(
      code: "INVALID_REQUEST",
      message: "The request is invalid.",
      status: :bad_request,
      details: { parameter: error.param }
    ))
  end

  def render_record_invalid(error)
    render_api_error(ApiError.new(
      code: "VALIDATION_FAILED",
      message: "The request could not be applied.",
      status: :unprocessable_content,
      details: { fields: error.record.errors.attribute_names.map(&:to_s) }
    ))
  end

  def render_internal_error(error)
    Rails.logger.error(
      event: "unhandled_api_error",
      error_class: error.class.name,
      request_id: request.request_id
    )
    render_api_error(ApiError.new(
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
      status: :internal_server_error,
      retryable: true
    ))
  end

  def response_meta
    { request_id: request.request_id, correlation_id: Current.correlation_id }.compact
  end

  def prevent_authenticated_response_caching
    return unless Current.user

    response.headers["Cache-Control"] = "private, no-store"
    response.headers["Pragma"] = "no-cache"
  end
end
