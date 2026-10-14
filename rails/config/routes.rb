Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get "health", to: "health#show"
      get "me", to: "me#show"
      get "organizations", to: "organizations#index"
      get "organizations/:organization_id", to: "organizations#show"
      get "organizations/:organization_id/memberships/me", to: "organization_memberships#me"
    end
  end
end
