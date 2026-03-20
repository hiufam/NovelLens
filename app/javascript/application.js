import "helpers/string"
import "helpers/elements"

import "apis/conversion"
import "apis/dictionary"

import "views/home"
import "views/viewer"
import "views/header"
import "views/translator-viewer"
import "views/doc-viewer"
import "views/images-viewer"
import "views/wiki-viewer"

import "modules/tree"
import "modules/container-view"
import "modules/dragbox"
import "modules/resizer"

import "constants/views"

// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

// Initialize bootstrap tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
