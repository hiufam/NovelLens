class Session < ApplicationRecord
  # Add methods (including "user" method)
  # https://api.rubyonrails.org/classes/ActiveRecord/Associations/ClassMethods.html#method-i-belongs_to
  belongs_to :user

  # Define class method not instance method
  def self.sweep(time = 1.hour)
    where(updated_at: ...time.ago).or(where(created_at: ...30.days.ago)).delete_all
  end
end
