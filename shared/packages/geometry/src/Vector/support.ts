import { ensureInt, ensureNumber, isNumber, compareNumbers, isNumberArray, isPlainObject, fromKeys } from '@step-wise/utils'

import { type CoordinateKey, type CoordinateList, type CoordinateObject, type VectorInput, coordinateKeys } from './types'

// Check how many parameters a coordinate object has.
export function getCoordinateObjectDimension(coordinates: Record<string, unknown>) {
	const parameterCount = coordinateKeys.findIndex(parameter => coordinates[parameter] === undefined)
	return parameterCount === -1 ? coordinateKeys.length : parameterCount
}

// Check if the given value is a coordinate list.
export function isCoordinateList(value: unknown): value is CoordinateList {
	return Array.isArray(value) && value.length > 0 && value.length <= coordinateKeys.length && value.every(item => isNumber(item))
}

// Check if the given value is a coordinate object.
export function isCoordinateObject(value: unknown): value is CoordinateObject {
	if (!isPlainObject(value)) return false
	const obj = value as Record<string, unknown>

	// Check that there is an x parameter.
	const parameterCount = getCoordinateObjectDimension(obj)
	if (parameterCount === 0) throw new Error(`Invalid coordinates: expected an object with coordinates "x", "y", ... but the x-parameter is already missing.`)

	// Ensure there are no irrelevant parameters.
	if (Object.keys(obj).length !== parameterCount) throw new Error(`Invalid coordinates: expected an object with only coordinates "x", "y", ... but received an object with more parameters. Please insert only clean coordinates objects.`)

	// Ensure all parameters are numbers.
	const parameters = coordinateKeys.slice(0, parameterCount)
	return parameters.every(parameter => isNumber(obj[parameter]))
}

// Check if the given value is a vector input.
export function isVectorInput(value: unknown): value is VectorInput {
	return isCoordinateList(value) || isCoordinateObject(value)
}

// Turn a coordinate object into a coordinate list.
export function coordinatesFromObject(coordinates: CoordinateObject): CoordinateList {
	// Find the number of coordinates and extract these into a list of coordinates.
	const parameterCount = getCoordinateObjectDimension(coordinates)
	return coordinateKeys.slice(0, parameterCount).map(parameter => (coordinates as Record<CoordinateKey, number>)[parameter])
}
