function Image(el)
  local filename = el.src:match("([^/]+)$")
  local name = filename:gsub("%.[^.]+$", "")
  el.identifier = name

  return el
end
