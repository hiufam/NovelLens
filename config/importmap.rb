# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"

pin_all_from "app/javascript/modules", under: "modules"
pin_all_from "app/javascript/apis", under: "apis"
pin_all_from "app/javascript/views", under: "views"
pin_all_from "app/javascript/helpers", under: "helpers"

