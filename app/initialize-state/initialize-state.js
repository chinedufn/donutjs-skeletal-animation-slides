var extend = require('xtend')
var SS = require('solid-state')
var mat4Perspective = require('gl-mat4/perspective')

module.exports = initializeState

var defaultState = {
  // Set the default path for the router
  path: require('global/document').location ? require('global/document').location.pathname : '/',
  slideNum: 0,
  currentClockTime: 0,
  camera: {
    xRadians: 0,
    yRadians: 0
  },
  viewport: {
    width: 500,
    height: 500,
    perspective: mat4Perspective([], Math.PI / 4, 500 / 500, 0.01, 100)
  },
  timeIsFrozen: false,
  // Time specified by our input sliders
  sliderTime: 0
}

function initializeState (initialState) {
  initialState = extend(defaultState, initialState)

  var AppState = new SS(initialState)

  return AppState
}
