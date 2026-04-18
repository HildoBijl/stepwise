import { alphabet } from '@step-wise/utils'

import { PolynomialMatrix, VariableList } from './types'

// Convert a polynomial matrix to a readable string representation.
const defaultVariableList = alphabet.split('')
export function polynomialMatrixToString(matrix: PolynomialMatrix | number, variableList: VariableList = defaultVariableList, indexList: number[] = []): string {
	// Turn a number into the respective string.
	if (!Array.isArray(matrix)) {
		if (matrix === 0) return '0'
		const termString = getPolynomialTermString(indexList, variableList)
		if (matrix === 1) return `+${termString === '' ? '1' : termString}`
		if (matrix === -1) return `-${termString === '' ? '1' : termString}`
		if (matrix as number > 0) return `+${matrix}${termString === '' ? '' : '*'}${termString}`
		return `${matrix}${termString === '' ? '' : '*'}${termString}`
	}

	// For an array, iterate deeper.
	let polynomialString = matrix.map((submatrix, index) => polynomialMatrixToString(submatrix, variableList, [...indexList, index])).filter(str => str !== '0').join('')

	// Handle edge cases.
	if (indexList.length === 0 && polynomialString[0] === '+') polynomialString = polynomialString.slice(1)
	if (polynomialString.length === 0) polynomialString = '0'
	return polynomialString
}

// Convert a list of exponents like [2,1,0,3] to a polynomial term string like "a^2*b*d^3".
export function getPolynomialTermString(indexList: number[], variableList: VariableList = defaultVariableList): string {
	if (indexList.length > variableList.length) throw new Error(`Cannot display polynomial string: there are more variables (${indexList.length}) than there are variable strings provided (${variableList.length}).`)
	return indexList.map((exponent, index) => {
		if (exponent === 0) return undefined
		if (exponent === 1) return variableList[index]
		return `${variableList[index]}^${exponent}`
	}).filter(term => term !== undefined).join('*')
}
