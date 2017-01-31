// Find the div for place the slides into. If we can't find one
// we create one and insert it into the DOM
var mountLocation = document.getElementById('donutjs-skeletal-animation-slides')
if (!mountLocation) {
  mountLocation = document.createElement('div')
  mountLocation.id = 'donutjs-skeletal-animation-slides'
  mountLocation.style.height = '100%'
  document.body.appendChild(mountLocation)
}

// Start our slides application and insert it into the DOM
var slidesElement = require('./app/app.js')().element
mountLocation.insertBefore(slidesElement, mountLocation.children[0])

document.querySelector('html').style.height = '100%'
document.body.style.height = '100%'
document.body.style.margin = 0
