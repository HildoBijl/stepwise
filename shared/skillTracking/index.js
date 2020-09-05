// Merge all file exports into one big export for easy accessing. Note the order: this is the order in which they are also defined. Bottom files may import top files but not vice versa.
module.exports = {
	...require('./evaluation'), // Basic analysis without changing coefficients.
	...require('./manipulation.js'), // Basic changing of coefficients. Is only used internally.
	...require('./smoothing'), // Smoothing coefficient arrays.
	...require('./dataSet'), // Everything related to data sets.
	...require('./combiners'), // Everything related to combiners.
	...require('./inference'), // Making predictions of the future.
	...require('./updating'), // Adjusting coefficients based on observations.
}