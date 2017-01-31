var animationSystem = require('skeletal-animation-system')
var createOrbitCamera = require('create-orbit-camera')
var vec3Normalize = require('gl-vec3/normalize')
var vec3Scale = require('gl-vec3/scale')

module.exports = {
  renderHTML: renderMoreVertices,
  renderCanvas: renderCanvas
}

function renderMoreVertices (h, StateStore) {
  var state = StateStore.get()

  return h('div', {
  }, [
    h('h1', {
    }, 'If we start time up again - the points move'),
    h('button#time', {
      className: state.timeIsFrozen ? 'green' : 'red',
      onclick: function () {
        state = StateStore.get()
        // Toggle time
        StateStore.set('timeIsFrozen', !state.timeIsFrozen)
      }
    }, state.timeIsFrozen ? 'Start Time' : 'Freeze Time'),
    h('label', {
    }, state.currentClockTime.toFixed(1) + ' seconds')
  ])
}

function renderCanvas (gl, models, state) {
  gl.viewport(0, 0, state.viewport.width, state.viewport.height)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.useProgram(models.cowboy.shaderProgram)

  var camera = createOrbitCamera({
    position: [0, 20, 35],
    target: [0, 0, 0],
    xRadians: state.camera.xRadians,
    yRadians: state.camera.yRadians
  })

  var lightingDirection = [1, -3, -1]
  var normalizedLD = []
  vec3Normalize(normalizedLD, lightingDirection)
  vec3Scale(normalizedLD, normalizedLD, -1)
  // require('gl-vec3/transformMat4')(normalizedLD, normalizedLD, camera.viewMatrix)

  var jointNums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
  var interpolatedQuats = animationSystem.interpolateJoints({
    blendFunction: function (dt) {
      // Blend linearly over 1 second
      return dt
    },
    currentTime: state.currentClockTime,
    keyframes: models.cowboy.keyframes,
    jointNums: jointNums,
    currentAnimation: {
      range: [6, 17],
      startTime: 0
    }
    // previousAnimation: state.upperBody.previousAnimation
  })

  var interpolatedRotQuats = []
  var interpolatedTransQuats = []

  jointNums.forEach(function (jointNum) {
    interpolatedRotQuats[jointNum] = interpolatedQuats[jointNum].slice(0, 4)
    interpolatedTransQuats[jointNum] = interpolatedQuats[jointNum].slice(4, 8)
  })

  var uniforms = {
    uUseLighting: true,
    uAmbientColor: [0.2, 0.2, 0.2],
    uLightingDirection: normalizedLD,
    uDirectionalColor: [1.0, 0, 0],
    uMVMatrix: camera.viewMatrix,
    uPMatrix: state.viewport.perspective
  }

  jointNums.forEach(function (jointNum) {
    uniforms['boneRotQuaternions' + jointNum] = interpolatedRotQuats[jointNum]
    uniforms['boneTransQuaternions' + jointNum] = interpolatedTransQuats[jointNum]
  })

  models.cowboy.draw({
    attributes: {
      aVertexPosition: models.cowboy.bufferData.aVertexPosition,
      aVertexNormal: models.cowboy.bufferData.aVertexNormal,
      aJointIndex: models.cowboy.bufferData.aJointIndex,
      aJointWeight: models.cowboy.bufferData.aJointWeight
    },
    uniforms: uniforms
  })
}

