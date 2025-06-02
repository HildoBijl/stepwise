// flattenFully flattens an array until it has no arrays left.
function flattenFully(array) {
	while (array.some(element => Array.isArray(element)))
		array = array.flat()
	return array
}
module.exports.flattenFully = flattenFully

// forceIntoShape takes a list and turns it into the shape given by the shape argument. If you provide a list [3, 5, 7, 9, 11] and a shape [[*, *], *, [*, [*]]], then the result will be [[3, 5], 7, [9, [11]]]. (The values of the shape do not matter.) You could see this as a form of array unflatten. Optionally, an array in the shape can be given a property "include: false" in which case the matching elements will at the end be removed from the final shape.
function forceIntoShape(list, shape) {
	// Perform the unflattening.
	let counter = 0
	const forceIntoShapeRecursion = (shape) => {
		// Recursively set up the result.
		const result = shape.map(shapeElement => (Array.isArray(shapeElement)) ? forceIntoShapeRecursion(shapeElement) : list[counter++])

		// If the result should not be included, return undefined. If it should be included, filter out undefineds.
		if (shape.include === false)
			return undefined
		return result.filter(element => element !== undefined)
	}
	const result = forceIntoShapeRecursion(shape, 0)

	// Check if we didn't run into the end of the list.
	if (counter > list.length)
		throw new Error(`Invalid list/shape combination: the list had fewer elements than the shape, which is not allowed.`)

	return result
}
module.exports.forceIntoShape = forceIntoShape
