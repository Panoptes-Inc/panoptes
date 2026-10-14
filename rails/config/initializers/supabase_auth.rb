Rails.application.config.x.supabase_jwks_fetcher = nil

Rails.application.config.after_initialize do
  Auth::SupabaseJwtConfiguration.from_env! if Rails.env.production?
end
