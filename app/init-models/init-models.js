var loadDae = require('load-collada-dae')
loadDae = require('../../../../opensource/load-collada-dae/')
var mat4ToDualQuat = require('mat4-to-dual-quat')

module.exports = initModels

function initModels (gl) {
  var models = { }

  models.cube = loadModel(gl, require('../../asset/cube.json'))
  models.cubeBone = loadModel(gl, require('../../asset/cube-bone.json'))
  models.weightPaint = loadModel(gl, require('../../asset/tall-bendy-thing.json'), {
    vertexShaderFunc: weightPaintShader
  })
  models.weightPaintBones = loadModel(gl, require('../../asset/tall-bendy-thing-bones.json'), {
    vertexShaderFunc: weightPaintBoneShader
  })
  models.cowboy = loadModel(gl, require('../../asset/cowboy.json'), {})
  models.cowboyBones = loadModel(gl, require('../../asset/cowboy-bones.json'), {})
  models.socialMedia = loadModel(gl, require('../../asset/chinedufn.json'), {})



  return models
}

function loadModel (gl, modelJSON, loadOpts) {
  var loadedSkeletalModel = {}
  var modelData = loadDae(gl, modelJSON, loadOpts || {})
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

function weightPaintShader (opts) {
  return `
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;

    uniform bool uUseLighting;
    uniform vec3 uAmbientColor;
    uniform vec3 uLightingDirection;
    uniform vec3 uDirectionalColor;
    varying vec3 vLightWeighting;

    attribute vec4 aJointIndex;
    attribute vec4 aJointWeight;
    uniform vec4 boneRotQuaternions[${opts.numJoints}];
    uniform vec4 boneTransQuaternions[${opts.numJoints}];

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    void main (void) {
      vec4 rotQuaternion[4];
      vec4 transQuaternion[4];

      for (int i = 0; i < 2; i++) {
        if (aJointIndex.x == float(i)) {
          rotQuaternion[0] = boneRotQuaternions[i];
          transQuaternion[0] = boneTransQuaternions[i];
        }
        if (aJointIndex.y == float(i)) {
          rotQuaternion[1] = boneRotQuaternions[i];
          transQuaternion[1] = boneTransQuaternions[i];
        }
        if (aJointIndex.z == float(i)) {
          rotQuaternion[2] = boneRotQuaternions[i];
          transQuaternion[2] = boneTransQuaternions[i];
        }
        if (aJointIndex.w == float(i)) {
          rotQuaternion[3] = boneRotQuaternions[i];
          transQuaternion[3] = boneTransQuaternions[i];
        }
      }

      vec4 weightedRotQuat = rotQuaternion[0] * aJointWeight.x +
        rotQuaternion[1] * aJointWeight.y +
        rotQuaternion[2] * aJointWeight.z +
        rotQuaternion[3] * aJointWeight.w;

      vec4 weightedTransQuat = transQuaternion[0] * aJointWeight.x +
        transQuaternion[1] * aJointWeight.y +
        transQuaternion[2] * aJointWeight.z +
        transQuaternion[3] * aJointWeight.w;

      float xRot = weightedRotQuat[0];
      float yRot = weightedRotQuat[1];
      float zRot = weightedRotQuat[2];
      float wRot = weightedRotQuat[3];
      float rotQuatMagnitude = sqrt(xRot * xRot + yRot * yRot + zRot * zRot + wRot * wRot);
      weightedRotQuat = weightedRotQuat / rotQuatMagnitude;
      weightedTransQuat = weightedTransQuat / rotQuatMagnitude;

      float xR = weightedRotQuat[0];
      float yR = weightedRotQuat[1];
      float zR = weightedRotQuat[2];
      float wR = weightedRotQuat[3];

      float xT = weightedTransQuat[0];
      float yT = weightedTransQuat[1];
      float zT = weightedTransQuat[2];
      float wT = weightedTransQuat[3];

      float t0 = 2.0 * (-wT * xR + xT * wR - yT * zR + zT * yR);
      float t1 = 2.0 * (-wT * yR + xT * zR + yT * wR - zT * xR);
      float t2 = 2.0 * (-wT * zR - xT * yR + yT * xR + zT * wR);

      mat4 weightedMatrix = mat4(
            1.0 - (2.0 * yR * yR) - (2.0 * zR * zR),
            (2.0 * xR * yR) + (2.0 * wR * zR),
            (2.0 * xR * zR) - (2.0 * wR * yR),
            0,
            (2.0 * xR * yR) - (2.0 * wR * zR),
            1.0 - (2.0 * xR * xR) - (2.0 * zR * zR),
            (2.0 * yR * zR) + (2.0 * wR * xR),
            0,
            (2.0 * xR * zR) + (2.0 * wR * yR),
            (2.0 * yR * zR) - (2.0 * wR * xR),
            1.0 - (2.0 * xR * xR) - (2.0 * yR * yR),
            0,
            t0,
            t1,
            t2,
            1
            );

      vec4 leftWorldSpace = weightedMatrix * vec4(aVertexPosition, 1.0);
      float y = leftWorldSpace.z;
      float z = -leftWorldSpace.y;
      leftWorldSpace.y = y;
      leftWorldSpace.z = z;

      if (uUseLighting) {
        vec3 transformedNormal = (weightedMatrix * vec4(aVertexNormal, 0.0)).xyz;
        y = transformedNormal.z;
        z = -transformedNormal.y;
        transformedNormal.y = y;
        transformedNormal.z = z;

        float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);
        vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;

        vLightWeighting = vec3(aJointWeight.y, 0.0, 1.0 - aJointWeight.y);
      } else {
        vLightWeighting = vec3(1.0, 1.0, 1.0);
      }

      gl_Position = uPMatrix * uMVMatrix * leftWorldSpace;
    }
  `
}

function weightPaintBoneShader (opts) {
  return `
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;

    uniform bool uUseLighting;
    uniform vec3 uAmbientColor;
    uniform vec3 uLightingDirection;
    uniform vec3 uDirectionalColor;
    varying vec3 vLightWeighting;

    attribute vec4 aJointIndex;
    attribute vec4 aJointWeight;
    uniform vec4 boneRotQuaternions[${opts.numJoints}];
    uniform vec4 boneTransQuaternions[${opts.numJoints}];

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    void main (void) {
      vec4 rotQuaternion[4];
      vec4 transQuaternion[4];
      vec3 boneColor;

      for (int i = 0; i < 2; i++) {
        if (aJointIndex.x == float(i)) {
          rotQuaternion[0] = boneRotQuaternions[i];
          transQuaternion[0] = boneTransQuaternions[i];
          boneColor = vec3(1.0, 0.0, 0.0);
        }
        if (aJointIndex.y == float(i)) {
          rotQuaternion[1] = boneRotQuaternions[i];
          transQuaternion[1] = boneTransQuaternions[i];
          boneColor = vec3(0.0, 0.0, 1.0);
        }
        if (aJointIndex.z == float(i)) {
          rotQuaternion[2] = boneRotQuaternions[i];
          transQuaternion[2] = boneTransQuaternions[i];
        }
        if (aJointIndex.w == float(i)) {
          rotQuaternion[3] = boneRotQuaternions[i];
          transQuaternion[3] = boneTransQuaternions[i];
        }
      }

      vec4 weightedRotQuat = rotQuaternion[0] * aJointWeight.x +
        rotQuaternion[1] * aJointWeight.y +
        rotQuaternion[2] * aJointWeight.z +
        rotQuaternion[3] * aJointWeight.w;

      vec4 weightedTransQuat = transQuaternion[0] * aJointWeight.x +
        transQuaternion[1] * aJointWeight.y +
        transQuaternion[2] * aJointWeight.z +
        transQuaternion[3] * aJointWeight.w;

      float xRot = weightedRotQuat[0];
      float yRot = weightedRotQuat[1];
      float zRot = weightedRotQuat[2];
      float wRot = weightedRotQuat[3];
      float rotQuatMagnitude = sqrt(xRot * xRot + yRot * yRot + zRot * zRot + wRot * wRot);
      weightedRotQuat = weightedRotQuat / rotQuatMagnitude;
      weightedTransQuat = weightedTransQuat / rotQuatMagnitude;

      float xR = weightedRotQuat[0];
      float yR = weightedRotQuat[1];
      float zR = weightedRotQuat[2];
      float wR = weightedRotQuat[3];

      float xT = weightedTransQuat[0];
      float yT = weightedTransQuat[1];
      float zT = weightedTransQuat[2];
      float wT = weightedTransQuat[3];

      float t0 = 2.0 * (-wT * xR + xT * wR - yT * zR + zT * yR);
      float t1 = 2.0 * (-wT * yR + xT * zR + yT * wR - zT * xR);
      float t2 = 2.0 * (-wT * zR - xT * yR + yT * xR + zT * wR);

      mat4 weightedMatrix = mat4(
            1.0 - (2.0 * yR * yR) - (2.0 * zR * zR),
            (2.0 * xR * yR) + (2.0 * wR * zR),
            (2.0 * xR * zR) - (2.0 * wR * yR),
            0,
            (2.0 * xR * yR) - (2.0 * wR * zR),
            1.0 - (2.0 * xR * xR) - (2.0 * zR * zR),
            (2.0 * yR * zR) + (2.0 * wR * xR),
            0,
            (2.0 * xR * zR) + (2.0 * wR * yR),
            (2.0 * yR * zR) - (2.0 * wR * xR),
            1.0 - (2.0 * xR * xR) - (2.0 * yR * yR),
            0,
            t0,
            t1,
            t2,
            1
            );

      vec4 leftWorldSpace = weightedMatrix * vec4(aVertexPosition, 1.0);
      float y = leftWorldSpace.z;
      float z = -leftWorldSpace.y;
      leftWorldSpace.y = y;
      leftWorldSpace.z = z;

      if (uUseLighting) {
        vec3 transformedNormal = (weightedMatrix * vec4(aVertexNormal, 0.0)).xyz;
        y = transformedNormal.z;
        z = -transformedNormal.y;
        transformedNormal.y = y;
        transformedNormal.z = z;

        float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);
        vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;

        vLightWeighting = boneColor;
      } else {
        vLightWeighting = vec3(1.0, 1.0, 1.0);
      }

      gl_Position = uPMatrix * uMVMatrix * leftWorldSpace;
    }
  `
}
