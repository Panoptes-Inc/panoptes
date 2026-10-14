class Current < ActiveSupport::CurrentAttributes
  attribute :user, :organization, :membership, :request_id, :correlation_id
end
