var initializeState = require('./initialize-state/initialize-state.js')
var initHTMLRenderLoop = require('./render-html/init-html-render-loop.js')
var initCanvasRenderLoop = require('./canvas/init-canvas-render-loop.js')
var initCanvas = require('./canvas/init-canvas.js')
var initModels = require('./init-models/init-models.js')

module.exports = InitApp

/**
 * Start the slides application and return a DOM element
 * that the consumer can embed into a page
 */
function InitApp () {
  // Create a state store so that we can track state and update our UI whenever state changes
  // note: useful to easily pass this state handler around in small apps and demo's, but in a real application you'll want
  // to dispatch actions to reducers via something like `require('minidux')`.
  var StateStore = initializeState()

  // Create the DOM element that holds our controls and text for our slides
  var htmlRenderLoop = initHTMLRenderLoop(StateStore.get(), StateStore)
  var htmlElement = htmlRenderLoop.target

  // Redraw our HTML
  StateStore.addListener(function (newState) {
    htmlRenderLoop.update(newState)
  })

  var canvas = initCanvas()
  var gl = canvas.getContext('webgl')
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)

  // Load our animated models
  var models = initModels(gl)

  // Init our canvas request animation frame loop
  initCanvasRenderLoop(gl, models, StateStore)

  var appElement = document.createElement('div')
  appElement.style.height = '100%'
  appElement.appendChild(htmlElement)
  appElement.appendChild(canvas)

  return {
    element: appElement
  }
}
