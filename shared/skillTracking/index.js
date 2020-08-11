// Merge all file exports into one big export for easy accessing.
module.exports = {
	...require('./evaluation'),
	...require('./smoothing'),
	...require('./updating'),
}