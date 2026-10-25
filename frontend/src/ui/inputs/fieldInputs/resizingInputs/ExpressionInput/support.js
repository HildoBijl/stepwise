import { Condition } from '@step-wise/i18n'

import { InputTranslation } from 'ui/inputs/InputTranslation'
import { simplifyKey, keyboards, greekAlphabet } from 'ui/form'

import { expressionFunctions } from '../MathInput'

const mathKeys = keyboards.basicMath.keys
const keysToCheck = [...mathKeys, ...Object.keys(greekAlphabet)]

// keyboardSettings takes an FI object and determines what keyboard settings are appropriate.
export function keyboardSettings(FI, settings) {
	// Determine which keys to disable based on the position.
	const keySettings = {}
	keysToCheck.forEach(keyboardKey => {
		const key = simplifyKey(keyboardKey)
		keySettings[keyboardKey] = expressionFunctions.acceptsKey({ key }, FI, settings)
	})
	if (!settings.textMath && !settings.eMath)
		keySettings.eMath = false // A manual fix to hide the "e" mathematical button when no text keyboard is shown. (Because the eMath key is simplified to "e" for the acceptance check.)

	// Pass on settings.
	return {
		keySettings,
		basicMath: settings.basicMath && {},
		textMath: settings.textMath && {},
		greek: settings.greek && {},
	}
}

// errorToMessage turns an error during interpretation into a message to be displayed.
export function errorToMessage(error) {
	const { code, cause } = error
	switch (code) {
		// Special cases.
		case 'EmptyExpression':
			return <InputTranslation input="expressionInput" group={['validation']} id="emptyExpression">There's (part of) an expression missing here.</InputTranslation>

		// Bracket interpretation.
		case 'UnmatchedClosingBracket':
			return <InputTranslation input="expressionInput" group={['validation']} id="unmatchedClosingBracket">There is a closing bracket without corresponding opening bracket.</InputTranslation>
		case 'UnmatchedOpeningBracket':
			return <InputTranslation input="expressionInput" group={['validation']} id="unmatchedOpeningBracket">There is an opening bracket without corresponding closing bracket.</InputTranslation>

		// Sum interpretation.
		case 'PlusAtStart':
			return <InputTranslation input="expressionInput" group={['validation']} id="plusAtStart">There is a plus symbol at the start.</InputTranslation>
		case 'DoublePlusMinus':
			return <InputTranslation input="expressionInput" group={['validation']} id="doublePlusMinus">There are two subsequent plus/minus symbols.</InputTranslation>
		case 'PlusMinusAtEnd':
			return <InputTranslation input="expressionInput" group={['validation']} id="plusMinusAtEnd">There is a <Condition value={{ isPlus: cause === '+' }}><Condition.True>plus</Condition.True><Condition.False>minus</Condition.False></Condition> symbol at the end.</InputTranslation>

		// Product interpretation.
		case 'TimesAtStart':
			return <InputTranslation input="expressionInput" group={['validation']} id="timesAtStart">There is a multiplication symbol at the start of a term.</InputTranslation>
		case 'DoubleTimes':
			return <InputTranslation input="expressionInput" group={['validation']} id="doubleTimes">There are two subsequent multiplication symbols.</InputTranslation>
		case 'TimesAtEnd':
			return <InputTranslation input="expressionInput" group={['validation']} id="timesAtEnd">There is a multiplication symbol at the end of a term.</InputTranslation>

		// Advanced function interpretation.
		case 'UnknownBasicFunction':
		case 'UnknownAdvancedFunction':
			return <InputTranslation input="expressionInput" group={['validation']} id="unknownFunction">Encountered an unknown function "{{ name: cause }}".</InputTranslation>

		// Accent interpretation.
		case 'UnknownAccent':
			return <InputTranslation input="expressionInput" group={['validation']} id="unknownAccent">Encountered an unknown accent "{{ name: cause }}".</InputTranslation>
		case 'EmptyAccent':
			return <InputTranslation input="expressionInput" group={['validation']} id="emptyAccent">There is an empty accent.</InputTranslation>
		case 'TooLongAccent':
			return <InputTranslation input="expressionInput" group={['validation']} id="tooLongAccent">There is an accent with more than one character in it: "{{ contents: cause }}".</InputTranslation>

		// String interpretation.
		case 'InvalidSymbol':
			return <InputTranslation input="expressionInput" group={['validation']} id="invalidSymbol">Unexpected character "{{ character: cause }}".</InputTranslation>
		case 'SingleDecimalSeparator':
			return <InputTranslation input="expressionInput" group={['validation']} id="singleDecimalSeparator">There is a decimal separator without numbers around it.</InputTranslation>
		case 'MultipleDecimalSeparator':
			return <InputTranslation input="expressionInput" group={['validation']} id="multipleDecimalSeparator">There is a number with multiple decimal separators.</InputTranslation>

		// Subscript/superscript interpretation.
		case 'MisplacedSubscript':
			return <InputTranslation input="expressionInput" group={['validation']} id="misplacedSubscript">There is a subscript "{{ subscript: cause }}" without a variable.</InputTranslation>
		case 'MisplacedSuperscript':
			return <InputTranslation input="expressionInput" group={['validation']} id="misplacedSuperscript">There is an exponent without a term prior to it.</InputTranslation>
		case 'EmptySubscript':
			return <InputTranslation input="expressionInput" group={['validation']} id="emptySubscript">There is a subscript symbol "_" without a character after it.</InputTranslation>
		case 'EmptySuperscript':
			return <InputTranslation input="expressionInput" group={['validation']} id="emptySuperscript">There is an exponent symbol "^" without a character after it.</InputTranslation>
		case 'EmptySubSup':
			return <InputTranslation input="expressionInput" group={['validation']} id="emptySubSup">There is an empty subscript/superscript.</InputTranslation>

		default:
			console.error(error) // Display the error.
			return <InputTranslation input="expressionInput" group={['validation']} id="remaining">Failed to interpret what was written. There's something wrong with the notation used.</InputTranslation>
	}
}
