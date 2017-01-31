var insertStyles = require('insert-styles')

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

// Drop in some quick css to make things look better
insertStyles(
  `
  h1 {
    margin-bottom: 10px;
    margin-top: 5px;
    font-size: 38px;
    font-family: "Helvetica Neue";
  }

  div#upper-controls div {
    color: #ffff00;
    background-color: #00007d;
    text-align: center;
    width: 100%;
  }

  a {
    color: #ffff00;
  }

  a:hover {
    color: #ffffaa;
  }

  div#upper-controls button {
    margin-bottom: 5px;
    margin-right: 10px;
    border: none;
    outline: none;
    font-size: 24px;
  }

  div#upper-controls button.green {
    color: white;
    background-color: #4CAF50;
  }

  div#upper-controls button.red {
    color: white;
    background-color: #f44336;
  }

  div#upper-controls label {
    font-size: 26px;
  }

  div#upper-controls input {
  }
  `
)
