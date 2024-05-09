import { alphabet as greekAlphabet } from 'step-wise/data/greek'

import { Translation, Check } from 'i18n'
import { simplifyKey, keyboards } from 'ui/form'

import { expressionFunctions } from '../MathInput'

const mathKeys = keyboards.basicMath.keys
const keysToCheck = [...mathKeys, ...Object.keys(greekAlphabet)]

const translationPath = 'inputs'
const translationEntry = 'expressionInput.validation'

// keyboardSettings takes an FI object and determines what keyboard settings are appropriate.
export function keyboardSettings(FI, settings) {
	// Determine which keys to disable based on the position.
	const keySettings = {}
	keysToCheck.forEach(keyboardKey => {
		const key = simplifyKey(keyboardKey)
		keySettings[keyboardKey] = expressionFunctions.acceptsKey({ key }, FI, settings)
	})

	// Pass on settings.
	return {
		keySettings,
		basicMath: {},
		textMath: {},
		greek: settings.greek && {},
	}
}

// errorToMessage turns an error during interpretation into a message to be displayed.
export function errorToMessage(error) {
	console.log('Received', error)
	const { code, cause } = error
	switch (code) {
		// Special cases.
		case 'EmptyExpression':
			return <Translation path={translationPath} entry={`${translationEntry}.emptyExpression`}>There's (part of) an expression missing here.</Translation>

		// Bracket interpretation.
		case 'UnmatchedClosingBracket':
			return <Translation path={translationPath} entry={`${translationEntry}.unmatchedClosingBracket`}>There is a closing bracket without corresponding opening bracket.</Translation>
		case 'UnmatchedOpeningBracket':
			return <Translation path={translationPath} entry={`${translationEntry}.unmatchedOpeningBracket`}>There is an opening bracket without corresponding closing bracket.</Translation>

		// Sum interpretation.
		case 'PlusAtStart':
			return <Translation path={translationPath} entry={`${translationEntry}.plusAtStart`}>There is a plus symbol at the start.</Translation>
		case 'DoublePlusMinus':
			return <Translation path={translationPath} entry={`${translationEntry}.doublePlusMinus`}>There are two subsequent plus/minus symbols.</Translation>
		case 'PlusMinusAtEnd':
			return <Translation path={translationPath} entry={`${translationEntry}.plusMinusAtEnd`}>There is a <Check value={cause === '+'}><Check.True>plus</Check.True><Check.False>minus</Check.False></Check> symbol at the end.</Translation>

		// Product interpretation.
		case 'TimesAtStart':
			return <Translation path={translationPath} entry={`${translationEntry}.timesAtStart`}>There is a multiplication symbol at the start of a term.</Translation>
		case 'DoubleTimes':
			return <Translation path={translationPath} entry={`${translationEntry}.doubleTimes`}>There are two subsequent multiplication symbols.</Translation>
		case 'TimesAtEnd':
			return <Translation path={translationPath} entry={`${translationEntry}.timesAtEnd`}>There is a multiplication symbol at the end of a term.</Translation>

		// Advanced function interpretation.
		case 'UnknownBasicFunction':
		case 'UnknownAdvancedFunction':
			return <Translation path={translationPath} entry={`${translationEntry}.unknownFunction`}>Encountered an unknown function "{{ name: cause }}".</Translation>

		// Accent interpretation.
		case 'UnknownAccent':
			return <Translation path={translationPath} entry={`${translationEntry}.unknownAccent`}>Encountered an unknown accent "{{ name: cause }}".</Translation>
		case 'EmptyAccent':
			return <Translation path={translationPath} entry={`${translationEntry}.emptyAccent`}>There is an empty accent.</Translation>
		case 'TooLongAccent':
			return <Translation path={translationPath} entry={`${translationEntry}.tooLongAccent`}>There is an accent with more than one character in it: "{{ contents: cause }}".</Translation>

		// String interpretation.
		case 'InvalidSymbol':
			return <Translation path={translationPath} entry={`${translationEntry}.invalidSymbol`}>Unexpected character "{{ character: cause }}".</Translation>
		case 'SingleDecimalSeparator':
			return <Translation path={translationPath} entry={`${translationEntry}.singleDecimalSeparator`}>There is a decimal separator without numbers around it.</Translation>
		case 'MultipleDecimalSeparator':
			return <Translation path={translationPath} entry={`${translationEntry}.multipleDecimalSeparator`}>There is a number with multiple decimal separators.</Translation>

		// Subscript/superscript interpretation.
		case 'MisplacedSubscript':
			return <Translation path={translationPath} entry={`${translationEntry}.misplacedSubscript`}>There is a subscript "{{ subscript: cause }}" without a variable.</Translation>
		case 'MisplacedSuperscript':
			return <Translation path={translationPath} entry={`${translationEntry}.misplacedSuperscript`}>There is an exponent without a term prior to it.</Translation>

		default:
			console.error(error) // Display the error.
			return <Translation path={translationPath} entry={`${translationEntry}.remaining`}>Failed to interpret what was written. There's something wrong with the notation used.</Translation>
	}
}
