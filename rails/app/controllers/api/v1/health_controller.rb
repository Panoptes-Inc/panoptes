module Api
  module V1
    class HealthController < ApplicationController
      skip_before_action :authenticate_request!

      def show
        render_success(data: { status: "ok", service: "panoptes-rails-api" })
      end
    end
  end
end
