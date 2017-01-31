var animationSystem = require('skeletal-animation-system')
var createOrbitCamera = require('create-orbit-camera')
var vec3Normalize = require('gl-vec3/normalize')
var vec3Scale = require('gl-vec3/scale')

module.exports = {
  renderHTML: renderWeightPaintedPrismHTML,
  renderCanvas: renderCanvas
}

function renderWeightPaintedPrismHTML (h, StateStore) {
  return h('div', {
  }, 'Cube with controller')
}

var xRadians = 0
function renderCanvas (gl, models, state) {
  gl.viewport(0, 0, 500, 500)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.useProgram(models.weightPaint.shaderProgram)

  xRadians += 0.01
  var camera = createOrbitCamera({
    position: [0, 3, 15],
    target: [0, 0, 0],
    xRadians: 0,
    yRadians: 0
  })

  var lightingDirection = [1, -1, -1]
  var normalizedLD = []
  vec3Normalize(normalizedLD, lightingDirection)
  vec3Scale(normalizedLD, normalizedLD, -1)
  require('gl-vec3/transformMat4')(normalizedLD, normalizedLD, camera.viewMatrix)

  var jointNums = [0, 1]
  var interpolatedQuats = animationSystem.interpolateJoints({
    blendFunction: function (dt) {
      // Blend linearly over 1 second
      return dt
    },
    currentTime: state.currentClockTime,
    keyframes: models.weightPaint.keyframes,
    jointNums: jointNums,
    currentAnimation: {
      range: [0, 4],
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
    uAmbientColor: [0.4, 0.4, 0.4],
    uLightingDirection: normalizedLD,
    uDirectionalColor: [0.0, 1.0, 1.0],
    uMVMatrix: camera.viewMatrix,
    uPMatrix: state.perspective,
    boneRotQuaternions0: interpolatedRotQuats[0],
    boneTransQuaternions0: interpolatedTransQuats[0],
    boneRotQuaternions1: interpolatedRotQuats[1],
    boneTransQuaternions1: interpolatedTransQuats[1]
  }

  models.weightPaint.draw({
    attributes: {
      aVertexPosition: models.weightPaint.bufferData.aVertexPosition,
      aVertexNormal: models.weightPaint.bufferData.aVertexNormal,
      aJointIndex: models.weightPaint.bufferData.aJointIndex,
      aJointWeight: models.weightPaint.bufferData.aJointWeight
    },
    uniforms: uniforms
  })

  // renderBone(gl, models, state, interpolatedRotQuats, interpolatedTransQuats, camera, uniforms)
}

function renderBone (gl, models, state, interpolatedRotQuats, interpolatedTransQuats, camera, uniforms) {
  uniforms.uAmbientColor = [0, 0, 0.5]

  gl.useProgram(models.cubeBone.shaderProgram)
  models.weightPaint.draw({
    attributes: {
      aVertexPosition: models.cubeBone.bufferData.aVertexPosition,
      aVertexNormal: models.cubeBone.bufferData.aVertexNormal,
      aJointIndex: models.cubeBone.bufferData.aJointIndex,
      aJointWeight: models.cubeBone.bufferData.aJointWeight
    },
    uniforms: uniforms
  })
}
