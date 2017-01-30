var skeletalAnimationSystem = require('skeletal-animation-system')
var createOrbitCamera = require('create-orbit-camera')
var vec3Normalize = require('gl-vec3/normalize')
var vec3Scale = require('gl-vec3/scale')

module.exports = {
  renderHTML: renderIntroduction,
  renderCanvas: renderCanvas
}

function renderIntroduction (h, StateStore) {
  return h('div', {
  }, 'introduction')
}

var xRadians = 0
function renderCanvas (gl, models, state) {
  xRadians += 0.01
  var camera = createOrbitCamera({
    position: [0, 3, -15],
    target: [0, 0, 0],
    xRadians: 0,
    yRadians: xRadians
  })

  var lightingDirection = [1, -3, -1]
  var normalizedLD = []
  vec3Normalize(normalizedLD, lightingDirection)
  vec3Scale(normalizedLD, normalizedLD, -1)
  require('gl-vec3/transformMat4')(normalizedLD, normalizedLD, camera.viewMatrix)

  gl.viewport(0, 0, 500, 500)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.useProgram(models.cube.shaderProgram)
  models.cube.draw({
    attributes: {
      aVertexPosition: models.cube.bufferData.aVertexPosition,
      aVertexNormal: models.cube.bufferData.aVertexNormal,
      aJointIndex: models.cube.bufferData.aJointIndex,
      aJointWeight: models.cube.bufferData.aJointWeight
    },
    uniforms: {
      uUseLighting: true,
      uAmbientColor: [0.2, 0.2, 0.2],
      uLightingDirection: normalizedLD,
      uDirectionalColor: [1.0, 0, 0],
      uMVMatrix: camera.viewMatrix,
      uPMatrix: state.perspective,
      boneRotQuaternions0: models.cube.keyframes['0.04166662'][0].slice(0, 4),
      boneTransQuaternions0: models.cube.keyframes['0.04166662'][0].slice(4, 8)
    }
  })
}
