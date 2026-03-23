// app/javascript/controllers/index.js
import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Manually import your controllers
import HelloController from "./hello_controller"
application.register("hello", HelloController)
