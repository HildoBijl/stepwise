import { isLetter } from 'step-wise/util'
import { alphabet as greekAlphabet } from 'step-wise/data/greek'

export function isAcceptableChar(key) {
	return isLetter(key) || greekAlphabet[key] !== undefined
}

export function filterAcceptableChar(str) {
	return str.split('').filter(isAcceptableChar).join('')
}
