var mat4Perspective = require('gl-mat4/perspective')

module.exports = initCanvas

function initCanvas (StateStore) {
  var canvas = document.createElement('canvas')
  canvas.style.width = '100%'
  canvas.style.height = '100%'

  var observer = new window.MutationObserver(checkForCanvas.bind(observer, StateStore, stopObserving, canvas))
  observer.observe(document.body, {childList: true, subtree: true})

  // Adjust our viewport in state whenever the screen resizes, otherwise our would get distorted
  window.addEventListener('resize', function () {
    var positionInfo = canvas.getBoundingClientRect()
    canvas.height = positionInfo.height
    canvas.width = positionInfo.width
    StateStore.set('viewport', {
      width: canvas.width,
      height: canvas.height,
      perspective: mat4Perspective([], Math.PI / 4, canvas.width / canvas.height, 0.01, 100)
    })
  })

  canvas.addEventListener('touchstart', function preventScroll (e) {
    e.preventDefault()

    for (var i = 0; i < e.changedTouches.length; i++) {
      var touch = e.changedTouches[i]
      var touchID = touch.identifier
      StateStore.set('touches.' + touchID, {
        startXPos: touch.pageX,
        startYPos: touch.pageY,
        xPos: touch.pageX,
        yPos: touch.pageY
      })
    }
  })

  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault()

    var numTouches = e.changedTouches.length
    if (numTouches === 1) {
      var state = StateStore.get()
      var touch = e.changedTouches[0]
      var xDelta = touch.pageX - state.touches[touch.identifier].xPos
      var yDelta = touch.pageY - state.touches[touch.identifier].yPos

      var newXRadians = state.camera.xRadians + (yDelta / 225)
      var newYRadians = state.camera.yRadians - (xDelta / 225)
      newXRadians = Math.min(newXRadians, 0.8)
      newXRadians = Math.max(newXRadians, -0.8)

      state.touches[touch.identifier] = {
        xPos: touch.pageX,
        yPos: touch.pageY
      }
      state.camera = {
        xRadians: newXRadians,
        yRadians: newYRadians
      }
      StateStore.set(state)
    } else if (numTouches === 2) {
      // Zoom in and out
    }
  })

  canvas.addEventListener('touchend', function (e) {
    e.preventDefault()

    for (var i = 0; i < e.changedTouches.length; i++) {
      var touch = e.changedTouches[i]
      var touchID = touch.identifier
      StateStore.del('touches.' + touchID)
    }
  })

  canvas.addEventListener('mousedown', function (e) {
    StateStore.set('mousepressed', {
      startXPos: e.pageX,
      startYPos: e.pageY,
      xPos: e.pageX,
      yPos: e.pageY
    })
  })

  canvas.addEventListener('mousemove', function (e) {
    var state = StateStore.get()
    // If the mouse is currently held down then any mouse movement will cause the camera to move
    if (state.mousepressed) {
      var xDelta = e.pageX - state.mousepressed.xPos
      var yDelta = e.pageY - state.mousepressed.yPos

      var newXRadians = state.camera.xRadians + (yDelta / 200)
      var newYRadians = state.camera.yRadians - (xDelta / 200)

      // Clamp the camera between a maximum and minimum up and down rotation
      newXRadians = Math.min(newXRadians, 0.8)
      newXRadians = Math.max(newXRadians, -0.8)

      // Update our current mouse position so that we can compare against it on next mouse move
      state.mousepressed = {
        xPos: e.pageX,
        yPos: e.pageY
      }
      // Update our camera's rotation
      state.camera = {
        xRadians: newXRadians,
        yRadians: newYRadians
      }
      StateStore.set(state)
    }
  })

  // Set that the mouse is no longer pressed
  canvas.addEventListener('mouseup', function (e) {
    StateStore.set('mousepressed', false)
  })

  return canvas

  // TODO: I forgot what I'm even using this for
  function stopObserving () {
    observer.disconnect()
  }
}

function checkForCanvas (StateStore, stop, canvas, mutationRecords) {
  // wait this makes no sense. whatever
  mutationRecords.forEach(function (mutationRecord) {
    var positionInfo = canvas.getBoundingClientRect()
    canvas.width = positionInfo.width
    canvas.height = positionInfo.height
    StateStore.set('viewport', {
      width: canvas.width,
      height: canvas.height,
      perspective: mat4Perspective([], Math.PI / 4, canvas.width / canvas.height, 0.01, 100)
    })
    stop()
  })
}
