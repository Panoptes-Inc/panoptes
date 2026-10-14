module Api
  module V1
    class MeController < ApplicationController
      def show
        render_success(data: {
          id: Current.user.id,
          supabase_user_id: Current.user.supabase_user_id,
          email: Current.user.email,
          status: Current.user.status,
          system_admin: Current.user.system_admin?
        })
      end
    end
  end
end
