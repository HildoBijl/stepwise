// keysToObject takes an array of keys like ['num', 'den'] and applies a function func(key, index, resultObject) for each of these keys. The result is stored in an object like { num: func('num'), den: func('den') }. If the result is undefined, it is not stored in the object, unless specifically indicated.
function keysToObject(keys, func, filterUndefined = true) {
	const result = {}
	keys.forEach((key, index) => {
		const funcResult = func(key, index, result)
		if (funcResult !== undefined || !filterUndefined)
			result[key] = funcResult
	})
	return result
}
module.exports.keysToObject = keysToObject

// arraysToObject takes two arrays of equal length, one with keys and the other with values, and turns it into a plain object.
function arraysToObject(keys, values, filterUndefined) {
	return keysToObject(keys, (_, index) => values[index], filterUndefined)
}
module.exports.arraysToObject = arraysToObject
