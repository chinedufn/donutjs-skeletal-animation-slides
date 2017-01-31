var h = require('virtual-dom/h')

module.exports = renderHTML

var slides = require('../slides/index.js')

function renderHTML (StateStore) {
  var state = StateStore.get()

  return h('div', {
    style: {
      display: 'flex',
      width: '100%',
      height: '250px'
    }
  }, [
    // Left slide button
    h('button#slide-left', {
      onclick: function () {
        var curState = StateStore.get()
        curState.slideNum -= 1
        curState.slideNum = Math.max(0, curState.slideNum)
        StateStore.set(curState)
      }
    }, 'Previous'),

    state.slideNum,
    // Title and text
    slides[state.slideNum].renderHTML(h, StateStore),

    // Right slide button
    h('button#slide-right', {
      onclick: function () {
        var currentState = StateStore.get()
        currentState.slideNum += 1
        currentState.slideNum = Math.min(currentState.slideNum, 6)
        StateStore.set(currentState)
      },
      style: {
        marginLeft: 'auto'
      }
    }, 'Next')
  ])
}
