const { ensureNumberArray } = require('./checks')

// sum gives the sum of all array elements.
function sum(array) {
	return array.reduce((sum, v) => sum + v, 0)
}
module.exports.sum = sum

// product gives the product of all array elements.
function product(array) {
	return array.reduce((product, v) => product * v, 1)
}
module.exports.product = product

// count takes an array and a function and checks for how many elements this function returns a truthy value.
function count(array, fun) {
	return array.reduce((sum, item, index) => sum + (fun(item, index) ? 1 : 0), 0)
}
module.exports.count = count

// cumulative takes a number array and returns a cumulative version of it.
function cumulative(array) {
	array = ensureNumberArray(array)
	let sum = 0
	return array.map(value => sum += value)
}
module.exports.cumulative = cumulative
