var loadDae = require('load-collada-dae')
loadDae = require('../../../../opensource/load-collada-dae/')
var mat4ToDualQuat = require('mat4-to-dual-quat')

module.exports = initModels

function initModels (gl) {
  var models = { }

  models.cube = loadModel(gl, require('../../asset/cube.json'))
  models.cubeBone = loadModel(gl, require('../../asset/cube-bone.json'))

  return models
}

function loadModel (gl, modelJSON) {
  var loadedSkeletalModel = {}
  var modelData = loadDae(gl, modelJSON, {})
  loadedSkeletalModel.draw = modelData.draw
  loadedSkeletalModel.bufferData = modelData.bufferData
  loadedSkeletalModel.shaderProgram = modelData.shaderProgram

  // Convert the joint matrices into dual quaternions for better interpolation
  var dualQuatKeyframes = convertKeyframesToDualQuats(modelJSON.keyframes)
  // Attach the keyframes so that we can later interpolate them based on time and current animation
  loadedSkeletalModel.keyframes = dualQuatKeyframes

  return loadedSkeletalModel
}

function convertKeyframesToDualQuats (keyframes) {
  return Object.keys(keyframes)
  .reduce(function (acc, time) {
    var keyframesAtThisTime = keyframes[time]
    // Convert every keyframe matrix into a dual quaternion for dual quaternion linear blending
    keyframesAtThisTime = keyframesAtThisTime.map(function (matrix) {
      return mat4ToDualQuat(matrix)
    })

    acc[time] = keyframesAtThisTime
    return acc
  }, {})
}
