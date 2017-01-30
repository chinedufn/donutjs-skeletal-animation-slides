var rafLoop = require('raf-loop')

var slides = require('../slides/index.js')

module.exports = initCanvasRenderLoop

function initCanvasRenderLoop (gl, models, StateStore) {
  rafLoop(function (dt) {
    var state = StateStore.get()

    slides[state.slideNum].renderCanvas(gl, models, state)
  }).start()
}
