var rafLoop = require('raf-loop')

var slides = require('../slides/index.js')

module.exports = initCanvasRenderLoop

function initCanvasRenderLoop (gl, models, StateStore) {
  rafLoop(function (dt) {
    var state = StateStore.get()
    if (!state.timeIsFrozen) {
      state.currentClockTime += dt / 1000
      state.textRotation += dt / 3500
    }
    StateStore.set(state)
    state = StateStore.get()

    slides[state.slideNum].renderCanvas(gl, models, state)
  }).start()
}
