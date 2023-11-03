import { ensureNumber, ensureString, lastOf } from 'step-wise/util'

// ToDo: check if this file is still needed. It seems to be mostly deprecated after the introduction of the i18n package.

export function wordToUpperCase(word) {
	word = ensureString(word)
	return word[0].toUpperCase() + word.slice(1)
}

export function getCountingWord(num, upperCase = false) {
	// On an upper case request, get the lower case and simply make the first letter upper case.
	if (upperCase)
		return wordToUpperCase(getCountingWord(num, false))

	// Walk through all options.
	num = ensureNumber(num, true)
	switch (num) {
		case 0:
			return 'nul'
		case 1:
			return 'één'
		case 2:
			return 'twee'
		case 3:
			return 'drie'
		case 4:
			return 'vier'
		case 5:
			return 'vijf'
		case 6:
			return 'zes'
		case 7:
			return 'zeven'
		case 8:
			return 'acht'
		case 9:
			return 'negen'
		case 10:
			return 'tien'
		case 11:
			return 'elf'
		case 12:
			return 'twaalf'
		case 13:
			return 'dertien'
		case 14:
			return 'veertien'
		case 15:
			return 'vijftien'
		case 16:
			return 'zestien'
		case 17:
			return 'zeventien'
		case 18:
			return 'achttien'
		case 19:
			return 'negentien'
		case 20:
			return 'twintig'
		case 30:
			return 'dertig'
		case 40:
			return 'veertig'
		case 50:
			return 'vijftig'
		case 60:
			return 'zestig'
		case 70:
			return 'zeventig'
		case 80:
			return 'tachtig'
		case 90:
			return 'negentig'
		case 100:
			return 'honderd'
		case 1000:
			return 'duizend'
		case 10000:
			return 'tienduizend'
		case 100000:
			return 'honderdduizend'
		case 1000000:
			return 'een miljoen'
		case 1000000000:
			return 'een miljard'
		default:
			return num
	}
}

// getWordList takes an array of words like ['chair', 'table', 'couch'] and turns it into a textual list "chair, table and couch" in the respective language.
export function getWordList(words) {
	return words.slice(0, -1).join(', ') + (words.length > 1 ? ' en ' : '') + lastOf(words)
}
