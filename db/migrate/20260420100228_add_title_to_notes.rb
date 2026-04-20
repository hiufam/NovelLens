class AddTitleToNotes < ActiveRecord::Migration[8.1]
  def change
    add_column :notes, :title, :string, null: false
  end
end
