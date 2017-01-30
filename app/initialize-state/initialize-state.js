var extend = require('xtend')
var SS = require('solid-state')
var mat4Perspective = require('gl-mat4/perspective')

module.exports = initializeState

var defaultState = {
  // Set the default path for the router
  path: require('global/document').location ? require('global/document').location.pathname : '/',
  perspective: mat4Perspective([], Math.PI / 4, 500 / 500, 0.01, 100),
  slideNum: 0
}

function initializeState (initialState) {
  initialState = extend(defaultState, initialState)

  var AppState = new SS(initialState)

  return AppState
}
