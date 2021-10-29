export { getRandomBoolean } from '../util/random' // Exports this function here too, for uniformity's sake.

export function isFOofType(bool) {
	return typeof bool === 'boolean'
}

export function FOtoIO(bool) {
	return bool
}

export function IOtoFO(bool) {
	return bool
}

export function getEmpty() {
	return false
}

export function isEmpty(value) {
	return false // Never empty.
}

export function equals(a, b) {
	return IOtoFO(a) === IOtoFO(b)
}
