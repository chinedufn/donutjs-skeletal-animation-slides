var Router = require('routes')
var router = new Router()

module.exports = router

router.addRoute('0', require('../slides/introduction/introduction.js').renderHTML)
