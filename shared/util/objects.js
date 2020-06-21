// applyToEachParameter takes an object with multiple parameters, like { a: 2, b: 3}, and applies a function like (x) => 2*x to each parameter. It returns a new object (the old one is unchanged) with the result, like { a: 4, b: 6 }.
function applyToEachParameter(obj, func) {
	const result = {}
	Object.keys(obj).forEach(key => {
		result[key] = func(obj[key])
	})
	return result
}

module.exports = {
	applyToEachParameter,
}