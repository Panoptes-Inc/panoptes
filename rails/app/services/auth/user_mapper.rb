module Auth
  class UserMapper
    def self.call(claims)
      subject = claims.fetch("sub")
      email = claims["email"].to_s.presence&.slice(0, 320)

      user = User.find_or_initialize_by(supabase_user_id: subject)
      user.status ||= "active"
      raise ForbiddenError.new if user.suspended? || user.deleted?

      user.email = email if email
      user.last_authenticated_at = Time.current
      user.save!
      user
    rescue ActiveRecord::RecordNotUnique
      retry
    end
  end
end
