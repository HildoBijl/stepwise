const createCourseLoaders = require('./Course')

module.exports = db => ({
	...createCourseLoaders(db),
})
