import { Plural, Translation, useI18n, withTranslation } from '@step-wise/i18n'

const cardinalWords: Readonly<Record<number, string>> = {
	0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
	10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty',
	30: 'thirty', 40: 'forty', 50: 'fifty', 60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety',
	100: 'hundred', 1000: 'thousand', 10000: 'ten thousand', 100000: 'hundred thousand', 1000000: 'a million', 1000000000: 'a billion',
}
const ordinalWords: Readonly<Record<number, string>> = {
	0: 'zeroth', 1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth',
	10: 'tenth', 11: 'eleventh', 12: 'twelfth', 13: 'thirteenth', 14: 'fourteenth', 15: 'fifteenth', 16: 'sixteenth', 17: 'seventeenth', 18: 'eighteenth', 19: 'nineteenth', 20: 'twentieth',
	30: 'thirtieth', 40: 'fortieth', 50: 'fiftieth', 60: 'sixtieth', 70: 'seventieth', 80: 'eightieth', 90: 'ninetieth',
	100: 'hundredth', 1000: 'thousandth', 10000: 'ten thousandth', 100000: 'hundred thousandth', 1000000: 'millionth', 1000000000: 'billionth',
}

type CountingWordValueProps = { value: number, children?: never }
type CountingWordChildrenProps = { value?: never, children: number }
export type CountingWordProps = (CountingWordValueProps | CountingWordChildrenProps) & {
	ordinal?: boolean
	upperCase?: boolean
}

// Render small numbers as translated words and larger numbers in the active locale's numeric notation.
function CountingWordBase({ children, value: valueProp, ordinal = false, upperCase = false }: CountingWordProps) {
	const { locale } = useI18n()

	// Obtain and check the value.
	const value = valueProp ?? children
	if (!Number.isSafeInteger(value) || value < 0) throw new Error(`Invalid CountingWord value: expected a non-negative safe integer, but received "${value}".`)

	// Retrieve the number's word.
	const words = ordinal ? ordinalWords : cardinalWords
	const word = words[value]

	// If there's no word, just show the number (or on ordinal with counting addition). Otherwise show the counting word.
	const contents = word === undefined
		? ordinal ? <NumericOrdinal value={value} /> : new Intl.NumberFormat(locale).format(value)
		: <Translation folder={['language']} catalog="language" group={['counting', ordinal ? 'ordinal' : 'cardinal']} id={String(value)}>{word}</Translation>
	return upperCase ? <span style={{ textTransform: 'capitalize' }}>{contents}</span> : contents
}

// Display a text-based ordinal number like "21st", "32nd", "43rd", "54th", etcetera, but then also translated to other languages.
function NumericOrdinal({ value }: { value: number }) {
	return <Translation folder={['language']} catalog="language" group={['counting', 'ordinal']} id="numeric">
		<Plural value={{ value }} form="ordinal">
			<Plural.One><Plural.Value />st</Plural.One>
			<Plural.Two><Plural.Value />nd</Plural.Two>
			<Plural.Few><Plural.Value />rd</Plural.Few>
			<Plural.Other><Plural.Value />th</Plural.Other>
		</Plural>
	</Translation>
}

// A counting word is a self-contained language construct and must remain intact inside an outer Translation.
export const CountingWord = withTranslation(CountingWordBase, {
	tag: 'counting-word',
	translatedProps: [],
	canCopy: false,
	canDelete: false,
})
