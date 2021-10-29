import { isObject } from '../util/objects'
import { ensureCoef } from './evaluation'

// ensureDataSet checks whether the given object is a data set object. The check is not in-depth: it just confirms it's an object.
export function ensureDataSet(dataSet) {
	if (!isObject(dataSet))
		throw new Error(`Invalid data set: expected the data parameter to be an object but received something of type "${dataSet}".`)
	return dataSet
}

// getCoefFromDataSet gets a coefficient array from a data set based on the ID. It throws an error if the ID is not known.
export function getCoefFromDataSet(dataSet, id) {
	// Check input.
	dataSet = ensureDataSet(dataSet)
	if (!dataSet[id])
		throw new Error(`Invalid skill ID: the skill ID "${id}" did not exist in the given skill data set.`)
	return ensureCoef(dataSet[id])
}
