// union applies a union to two or more sets.
function union(...args) {
	// Deal with simple cases: 0, 1 or 2 arguments.
	if (args.length === 0)
		return new Set()
	if (args.length === 1)
		return args[0]
	if (args.length === 2) {
		const [setA, setB] = args
		const result = new Set(setA)
		for (const element of setB) {
			result.add(element)
		}
		return result
	}

	// Iterate over a larger array of args.
	let result = new Set()
	args.forEach(set => {
		result = union(result, set)
	})
	return result
}
module.exports.union = union

// intersection applies an intersection to two or more sets.
function intersection(...args) {
	// Deal with simple cases: 0, 1 or 2 arguments.
	if (args.length === 0)
		return new Set()
	if (args.length === 1)
		return args[0]
	if (args.length === 2) {
		const [setA, setB] = args
		let result = new Set()
		for (let element of setA) {
			if (setB.has(element)) {
				result.add(element)
			}
		}
		return result
	}

	// Iterate over a larger array of arguments.
	let result = new Set()
	args.forEach(set => {
		result = intersection(result, set)
	})
	return result
}
module.exports.intersection = intersection

// difference takes setA and removes all elements from setB.
function difference(setA, setB) {
	let result = new Set(setA)
	for (let element of setB) {
		result.delete(element)
	}
	return result
}
module.exports.difference = difference

// symmetricDifference takes two sets and applies an exclusiveOr, only giving elements that are in one of the two but not both.
function symmetricDifference(setA, setB) {
	let result = new Set(setA)
	for (let element of setB) {
		if (result.has(element)) {
			result.delete(element)
		} else {
			result.add(element)
		}
	}
	return result
}
module.exports.symmetricDifference = symmetricDifference
