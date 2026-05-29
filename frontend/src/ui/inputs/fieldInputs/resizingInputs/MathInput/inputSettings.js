import { defaultInterpretationSettings } from '@step-wise/math-input-value'
import { defaultExpressionSettings } from '@step-wise/cas'

// The input settings are the settings that can be provided to an Expression input field. They determine what can and cannot be entered.
export const defaultInputSettings = {
	// Settings related to keyboards.
	basicMath: true,
	textMath: true,

	// Settings only targeting buttons.
	plus: true,
	minus: true,
	plusMinus: true,
	times: true,
	brackets: true,
	pi: true,
	eMath: true,
	float: true,
	greek: true,

	// Settings also checked during interpretation.
	accent: true, // Are accents allowed?
	divide: true, // Are fractions allowed?
	power: true, // Are powers allowed?
	subscript: true, // Are subscripts of variables allowed?
	trigonometry: true, // Are trigonometric functions like sin, asin, arcsin, etcetera allowed?
	root: true, // Are root-based functions like sqrt and root allowed?
	logarithms: true, // Are logarithm-based functions like log and ln allowed?
	equals: false, // Are equals signs allowed?
}

export const defaultInterpretationExpressionSettings = { ...defaultInterpretationSettings, ...defaultExpressionSettings }
export const defaultFieldSettings = { ...defaultInputSettings, ...defaultInterpretationSettings, ...defaultExpressionSettings }

// isFunctionAllowed takes a function name (like "log") and an InputSettings object, and checks if the function is allowed, given the settings.
export function isFunctionAllowed(functionName, settings) {
	if (functionName === 'frac')
		return settings.divide
	if (functionName === 'subSup')
		return settings.power || settings.subscript
	if (functionName === 'sin' || functionName === 'cos' || functionName === 'tan' || functionName === 'asin' || functionName === 'acos' || functionName === 'atan' || functionName === 'arcsin' || functionName === 'arccos' || functionName === 'arctan')
		return settings.trigonometry
	if (functionName === 'sqrt' || functionName === 'root')
		return settings.root
	if (functionName === 'ln' || functionName === 'log')
		return settings.logarithms
	return false
}
