module.exports = initCanvas

function initCanvas () {
  var canvas = document.createElement('canvas')
  canvas.width = '500'
  canvas.height = '500'
  canvas.style.width = '500px'
  canvas.style.height = '500px'

  return canvas
}
