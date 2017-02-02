var h = require('virtual-dom/h')

module.exports = renderHTML

var slides = require('../slides/index.js')

function renderHTML (StateStore) {
  var state = StateStore.get()

  return h('div#upper-controls', {
    style: {
      display: 'flex',
      width: '100%',
      height: state.viewport.width < 600 ? '300px' : '250px'
    }
  }, [
    // Left slide button
    h('button#slide-left', {
      style: {
        backgroundColor: state.viewport.width < 600 ? 'red' : 'black',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: state.viewport.width < 600 ? '16px' : '48px',
        marginRight: '0px',
        outline: 'none',
        width: '50px',
        height: '100%'
      },
      onclick: function () {
        var curState = StateStore.get()
        curState.slideNum -= 1
        curState.slideNum = Math.max(0, curState.slideNum)
        StateStore.set(curState)
      }
    }, state.slideNum === 0 ? '' : '<'),

    // state.slideNum,
    // Title and text
    slides[state.slideNum].renderHTML(h, StateStore),

    // Right slide button
    h('button#slide-right', {
      style: {
        backgroundColor: state.viewport.width < 600 ? 'red' : 'black',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: state.viewport.width < 600 ? '16px' : '48px',
        marginRight: '0px',
        height: '100%',
        marginLeft: 'auto',
        outline: 'none',
        width: '50px'
      },
      onclick: function () {
        var currentState = StateStore.get()
        currentState.slideNum += 1
        currentState.slideNum = Math.min(currentState.slideNum, 18)
        StateStore.set(currentState)
      }
    }, state.slideNum === 18 ? '' : '>')
  ])
}
