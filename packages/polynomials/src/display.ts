import { PolynomialExpression, PolynomialMatrix, VariableList } from './types'

// Convert a polynome expression to a readable string representation.
export function polynomialToString(expression: PolynomialExpression): string {
	return polynomialMatrixToString(expression.matrix, expression.list)
}

// Convert a polynomial matrix to a readable string representation.
function polynomialMatrixToString(matrix: PolynomialMatrix | number, list: VariableList, indexList: number[] = []): string {
	// Turn a number into the respective string.
	if (!Array.isArray(matrix)) {
		if (matrix === 0) return '0'
		const termString = getPolynomialTermString(indexList, list)
		if (matrix === 1) return `+${termString === '' ? '1' : termString}`
		if (matrix === -1) return `-${termString === '' ? '1' : termString}`
		if (matrix as number > 0) return `+${matrix}${termString === '' ? '' : '*'}${termString}`
		return `${matrix}${termString === '' ? '' : '*'}${termString}`
	}

	// For an array, iterate deeper.
	let polynomialString = matrix.map((submatrix, index) => polynomialMatrixToString(submatrix, list, [...indexList, index])).filter(str => str !== '0').join('')

	// Handle edge cases.
	if (indexList.length === 0 && polynomialString[0] === '+') polynomialString = polynomialString.slice(1)
	if (polynomialString.length === 0) polynomialString = '0'
	return polynomialString
}

// Convert a list of exponents like [2,1,0,3] to a polynomial term string like "a^2*b*d^3".
function getPolynomialTermString(indexList: number[], list: VariableList): string {
	if (indexList.length > list.length) throw new Error(`Cannot display polynomial string: there are more variables (${indexList.length}) than there are variable strings provided (${list.length}).`)
	return indexList.map((exponent, index) => {
		if (exponent === 0) return undefined
		if (exponent === 1) return list[index]
		return `${list[index]}^${exponent}`
	}).filter(term => term !== undefined).join('*')
}
