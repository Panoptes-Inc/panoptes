class PanoptesRequestContext
  SAFE_ID = /\A[A-Za-z0-9._:-]{8,128}\z/

  def initialize(app)
    @app = app
  end

  def call(env)
    request_id = sanitized(env["HTTP_X_REQUEST_ID"]) || SecureRandom.uuid
    correlation_id = sanitized(env["HTTP_X_CORRELATION_ID"]) || request_id
    env["HTTP_X_REQUEST_ID"] = request_id
    env["panoptes.correlation_id"] = correlation_id

    status, headers, body = @app.call(env)
    headers["X-Request-Id"] = request_id
    headers["X-Correlation-Id"] = correlation_id
    [ status, headers, body ]
  end

  private

  def sanitized(value)
    value if value.is_a?(String) && SAFE_ID.match?(value)
  end
end
