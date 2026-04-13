# Singleton with only attributes. uses in request
class Current < ActiveSupport::CurrentAttributes
  attribute :session
  # Use get user method from session ActiveRecord class
  delegate :user, to: :session, allow_nil: true
end
