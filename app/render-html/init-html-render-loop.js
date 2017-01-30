var mainLoop = require('main-loop')
var renderHTML = require('./render-html.js')
var vdom = require('virtual-dom')

module.exports = initHTMLRenderLoop

/**
 * Create a function to update our DOM at most once every request animation frame
 */
function initHTMLRenderLoop (initialState, StateStore) {
  initialState = initialState || {}
  var loop = mainLoop(initialState, renderHTML.bind(null, StateStore), vdom)
  return loop
}
