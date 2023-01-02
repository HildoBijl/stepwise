// Load in all functions. Later modules may require earlier modules, but not vice versa.
module.exports = {
	...require('./logarithms'),
	...require('./trigonometry'),
}