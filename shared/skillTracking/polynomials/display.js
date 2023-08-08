const { alphabet } = require('../../util')

// polynomialMatrixToString takes a polynomial matrix and attempts to display it, using letters a, b, c, ... in a comprehensible form.
function polynomialMatrixToString(matrix, list, indexList = []) {
	// On an endpoint extract the relevant string.
	if (!Array.isArray(matrix)) {
		if (matrix === 0)
			return '0' // Zero.
		const str = getPolynomialTermString(indexList, list)
		if (matrix === 1)
			return `+${str === '' ? '1' : str}` // Plus one.
		if (matrix === -1)
			return `-${str === '' ? '1' : str}` // Minus one.
		if (matrix > 0)
			return `+${matrix}${str === '' ? '' : '*'}${str}` // Positive.
		return `${matrix}${str === '' ? '' : '*'}${str}` // Negative.
	}

	// On an array, iterate through it.
	const result = matrix.map((submatrix, index) => polynomialMatrixToString(submatrix, list, [...indexList, index]))

	// Turn the final result into a proper string.
	let str = result.filter(str => str !== '0').join('')
	if (indexList.length === 0 && str[0] === '+')
		str = str.slice(1)
	if (str.length === 0)
		str = '0'
	return str
}
module.exports.polynomialMatrixToString = polynomialMatrixToString

// getPolynomialTermString takes a list of indices like [2,1,0,3] and turns it into a polynomial string with the corresponding letters, like "a^2*b*d^3".
function getPolynomialTermString(indexList, list = alphabet) {
	if (indexList.length > list.length)
		throw new Error(`Cannot display polynomial string: there are more variables (${indexList.length}) than that there are variable strings provided (${list.length}).`)
	return indexList.map((exponent, index) => {
		if (exponent === 0)
			return // Do not use zero.
		if (exponent === 1)
			return list[index]
		return `${list[index]}^${exponent}`
	}).filter(value => value !== undefined).join('*')
}
module.exports.getPolynomialTermString = getPolynomialTermString
