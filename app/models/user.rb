class User < ApplicationRecord
  # Required to have "password_digest" in user model (default ":password" as attribute value)
  # Add authentication methods to instance of User class
  # One method is defined and used in authenticated_by: "authenticate_#{attribute}"
  # https://github.com/rails/rails/blob/fa8f0812160665bff083a089d2bb2fc1817ea03e/activemodel/lib/active_model/secure_password.rb#L223
  has_secure_password
  has_many :sessions, dependent: :destroy

  # :with -> callable object that accept attribute's value as argument
  # https://api.rubyonrails.org/v8.1.3/classes/ActiveModel/Attributes/Normalization/ClassMethods.html#method-i-normalizes
  normalizes :email_address, with: ->(e) { e.strip.downcase }
end
