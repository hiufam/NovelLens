# To tied to database use ActiveRecord. ActiveModel is a derivative of ActiveRecord with some of its methods
class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
end
