import { findNextOf, isLetter, last, InterpretationError } from '@step-wise/utils'
import { type InterpretationSettings, type AccentName, type ExpressionPartInputValue, type FunctionInputValue, type SubSupInputValue, type AccentInputValue, type InputValuePart, type ExpressionInputValue, type InputCursorEnd, isEmpty, getStartCursor, getEndCursor, getSubExpression, moveRight, getMatchingBrackets, isAccent, specialFunctionSettings, isExpressionPart } from '@step-wise/math-input-value'

import { ExpressionNode, Integer, Float, Variable, Sum, Product, Fraction, Power, Root, Log, PlusMinus } from '../nodes'
import { asExpressionNode } from '../creation'

import { type BasicFunctionName, type SpecialFunctionName, type SpecialFunctionConstructor, basicFunctionComponents, specialFunctionComponents } from './functionComponents'

type IntermediatePart = InputValuePart | ExpressionNode

// Turn an InputValue to an ExpressionNode.
export function inputValueToExpressionNode(input: ExpressionInputValue, settings: InterpretationSettings): ExpressionNode {
	return interpretInputValueParts(input.value, settings)
}

// Interpret brackets, including regular brackets, basic functions like sin(...), and special functions with a parameter after like log[...](...).
function interpretInputValueParts(value: InputValuePart[], settings: InterpretationSettings): ExpressionNode {
	if (isEmpty(value)) throw new InterpretationError('Could not interpret an empty Expression.', 'EmptyExpression')

	// Walk through matching brackets and add each part accordingly.
	const bracketSets = getMatchingBrackets(value)
	const result: IntermediatePart[] = []
	let lastPosition = getStartCursor(value)
	bracketSets.forEach(bracketSet => {
		const { opening, closing } = bracketSet
		const end = { ...opening }

		// Interpret opening brackets from special functions with brackets like log[10](...).
		if (value[opening.part].type === 'Function') {
			// Interpret the part prior to the function.
			end.part--
			end.cursor = getPartLength(value[end.part])
			result.push(...getSubExpression(value, lastPosition, end))

			// Interpret the special function.
			const element = value[opening.part] as FunctionInputValue
			const externalArgument = interpretInputValueParts(getSubExpression(value, { part: opening.part + 1, cursor: 0 }, closing), settings)
			const internalArguments = element.value.map(expression => interpretInputValueParts(expression.value, settings))
			result.push(interpretSpecialFunctionWithParameterAfter(element.name, externalArgument, internalArguments, settings))

			// Shift the cursor.
			lastPosition = moveRight(closing)
			return
		}

		// Interpret regular brackets like sin(...) and x(...).
		const partBetweenBrackets = getSubExpression(value, moveRight(opening), closing)
		const interpretedExpression = interpretInputValueParts(partBetweenBrackets, settings)
		const str = getExpressionPartValue(value[end.part])
		let movingCursor = end.cursor
		while (str[movingCursor - 1] && isLetter(str[movingCursor - 1])) movingCursor--
		const functionName = str.substring(movingCursor, end.cursor)

		// If the function name is in the allowed function list, add it.
		if (functionName in basicFunctionComponents) {
			end.cursor -= functionName.length
			result.push(...getSubExpression(value, lastPosition, end))
			result.push(new basicFunctionComponents[functionName as BasicFunctionName](interpretedExpression))
			lastPosition = moveRight(closing)
			return
		}

		// If custom functions are allowed, add as a function.
		if (settings.customFunctions) throw new Error(`Invalid interpretation settings: the custom functions option has not been implemented yet.`)

		// Add as a regular bracket.
		result.push(...getSubExpression(value, lastPosition, end))
		result.push(interpretedExpression)
		lastPosition = moveRight(closing)
	})

	// Add the remainder. Then continue processing.
	result.push(...getSubExpression(value, lastPosition, getEndCursor(value)))
	return interpretInputValueWithoutBrackets(result, settings)
}

// Interpret pluses, minuses and plus-minuses in an expression without brackets but with some already-interpreted ExpressionNodes.
function interpretInputValueWithoutBrackets(value: IntermediatePart[], settings: InterpretationSettings): ExpressionNode {
	// Set up a handler to add terms to the sum.
	const terms: ExpressionNode[] = []
	let symbolBefore = ''
	const addTerm = (start: InputCursorEnd, end: InputCursorEnd, symbolBefore: string) => {
		if (sameCursor(start, end)) return // Don't add things if the start and the end collide. (Like with a minus at the start of "-3x".)
		let expression = interpretInputValueWithoutPluses(getSubExpression<ExpressionNode>(value, start, end), settings)
		if (symbolBefore === '-') expression = new Product([Integer.minusOne, expression])
		if (symbolBefore === '±') expression = new Product([new PlusMinus(), expression])
		terms.push(expression)
	}

	// Walk through all expression parts, find pluses and minuses, and split the expressions up there.
	let start = getStartCursor(value)
	value.forEach((element, part) => {
		if (!isExpressionPart(element)) return
		const str = element.value
		const getNextPlusMinus = (startFrom = -1) => findNextOf(str, ['+', '-', '±'], startFrom + 1)
		for (let nextPlusMinus = getNextPlusMinus(); nextPlusMinus !== -1; nextPlusMinus = getNextPlusMinus(nextPlusMinus)) {
			let symbolAfter = str[nextPlusMinus]
			let end = { part, cursor: nextPlusMinus }

			// Run checks: no plus at the start, and notwo consecutive pluses/minuses, although "+-" like in "x+-3" is allowed.
			if (end.part === 0 && end.cursor === 0 && symbolAfter === '+') throw new InterpretationError('Could not interpret the Expression due to it starting with a plus.', 'PlusAtStart', '+')
			if (sameCursor(start, end) && (symbolBefore === symbolAfter || symbolAfter === '+')) throw new InterpretationError('Could not interpret the Expression due to a double plus/minus.', 'DoublePlusMinus', `${symbolBefore}${symbolAfter}`)

			// If we have "2+-3", "2±-3", "2-±3" or similar, jump over the second plus/minus character and incorporate it into the string to be interpreted.
			if (sameCursor(start, end)) {
				nextPlusMinus = getNextPlusMinus(nextPlusMinus)
				if (nextPlusMinus === -1) break
				symbolAfter = str[nextPlusMinus]
				end = { part, cursor: nextPlusMinus }
			}

			// If there is a minus sign or plus/minus preceded by a times, ignore it here and incorporate the minus when dealing with the product.
			if ((symbolAfter === '-' || symbolAfter === '±') && str[nextPlusMinus - 1] === '*') continue

			// Extract the term, process it, and shift cursors.
			addTerm(start, end, symbolBefore)
			symbolBefore = symbolAfter
			start = moveRight(end)
		}
	})

	// Add the remaining part (assuming there's no plus or minus at the end).
	const end = getEndCursor(value)
	if (sameCursor(start, end) && symbolBefore) throw new InterpretationError(`Could not interpret the Expression due to it ending with "${symbolBefore}".`, 'PlusMinusAtEnd', symbolBefore)
	addTerm(start, end, symbolBefore)

	// Assemble the result in a sum.
	if (terms.length === 0) throw new Error('Sum interpreting error: wound up with an empty sum.')
	if (terms.length === 1) return terms[0]
	return new Sum(terms)
}

// Interpret explicit products split by *, in an expression with partly interpreted parts.
function interpretInputValueWithoutPluses(value: IntermediatePart[], settings: InterpretationSettings): ExpressionNode {
	// Set up a handler to add factors to the product.
	const factors: ExpressionNode[] = []
	const addFactor = (start: InputCursorEnd, end: InputCursorEnd) => {
		const firstChar = getExpressionPartValue(value[start.part])[start.cursor]
		const minusAfterTimes = firstChar === '-' || firstChar === '±'
		const shiftedStart = minusAfterTimes ? moveRight(start) : start
		let expression = interpretInputValueWithoutProducts(getSubExpression<ExpressionNode>(value, shiftedStart, end), settings)
		if (minusAfterTimes) expression = firstChar === '-' ? new Product([Integer.minusOne, expression]) : new Product([new PlusMinus(), expression])
		factors.push(expression)
	}

	// Walk through all expression parts, find times operators, and split the expressions up there.
	let start = getStartCursor(value)
	value.forEach((element, part) => {
		if (!isExpressionPart(element)) return
		const str = element.value
		const getNextTimes = (startFrom = -1) => str.indexOf('*', startFrom + 1)
		for (let nextTimes = getNextTimes(); nextTimes !== -1; nextTimes = getNextTimes(nextTimes)) {
			const end = { part, cursor: nextTimes }

			// Run checks: no times at the start, and no double times.
			if (end.part === 0 && end.cursor === 0) throw new InterpretationError('Could not interpret the Expression due to it starting with a times operator.', 'TimesAtStart', '*')
			if (sameCursor(start, end)) throw new InterpretationError('Could not interpret the Expression due to a double times operator.', 'DoubleTimes', '**')

			// Extract, interpret and add the expression.
			addFactor(start, end)
			start = moveRight(end)
		}
	})

	// Add the remaining part (assuming there's no times symbol at the end).
	const end = getEndCursor(value)
	if (sameCursor(start, end)) throw new InterpretationError('Could not interpret the Expression due to it ending with a times operator.', 'TimesAtEnd', '*')
	addFactor(start, end)

	// Assemble the result in a product.
	if (factors.length === 0) throw new Error('Product interpreting error: wound up with an empty product.')
	if (factors.length === 1) return factors[0]
	return new Product(factors)
}

// Interpret strings, functions and accents that remain after brackets/sums/products.
function interpretInputValueWithoutProducts(value: IntermediatePart[], settings: InterpretationSettings): ExpressionNode {
	// Turn all ExpressionParts (strings) into arrays of interpreted elements. (Keep other elements, interpreted or not, as they are.)
	const interpretedParts = value.map(element => isExpressionPart(element) ? interpretString(element.value) : element).flat()

	// Interpret the remaining elements. This needs to be done after the interpreting of strings, in case of SubSups that need merging. Then turn the result into one big product.
	const elements = interpretElements(interpretedParts, settings)
	if (elements.length === 0) throw new InterpretationError('Could not interpret an empty Expression.', 'EmptyExpression')
	if (elements.length === 1) return elements[0]
	return new Product(elements)
}

// Interpret a string like "a2.3bc" as [a, 2.3, b, c].
const regInvalidSymbols = new RegExp(`[^a-zα-ω0-9.∞]`, 'i')
const regSingleDecimalSeparator = new RegExp(`(([^0-9]\\.[^0-9])|(^\\.[^0-9])|([^0-9]\\.$))`) // Period without any numbers.
const regMultipleDecimalSeparator = new RegExp(`\\.[0-9]*\\.`) // Number with two periods.
function interpretString(str: string): ExpressionNode[] {
	// Check for invalid formats.
	const invalidSymbolMatch = str.match(regInvalidSymbols)
	if (invalidSymbolMatch) throw new InterpretationError(`Could not interpret the string "${str}".`, 'InvalidSymbol', invalidSymbolMatch[0])
	const singleDecimalSeparatorMatch = str.match(regSingleDecimalSeparator)
	if (singleDecimalSeparatorMatch) throw new InterpretationError(`Could not interpret the string "${str}".`, 'SingleDecimalSeparator', singleDecimalSeparatorMatch[0])
	const multipleDecimalSeparatorMatch = str.match(regMultipleDecimalSeparator)
	if (multipleDecimalSeparatorMatch) throw new InterpretationError(`Could not interpret the string "${str}".`, 'MultipleDecimalSeparator', multipleDecimalSeparatorMatch[0])

	// Walk through the string and add all characters.
	let lastLetter = -1
	const terms: ExpressionNode[] = []
	for (let i = 0; i < str.length; i++) {
		if (isLetter(str[i]) || str[i] === '∞') {
			if (lastLetter < i - 1) terms.push(asExpressionNode(Number(str.substring(lastLetter + 1, i))))
			terms.push(new Variable(str[i]))
			lastLetter = i
		}
	}
	if (lastLetter < str.length - 1) terms.push(asExpressionNode(Number(str.substring(lastLetter + 1))))
	return terms
}

// Interpret remaining non-string elements.
function interpretElements(value: IntermediatePart[], settings: InterpretationSettings): ExpressionNode[] {
	const result: ExpressionNode[] = []
	value.forEach(element => {
		if (element instanceof ExpressionNode) return result.push(element)
		if (element.type === 'Accent') result.push(interpretAccent(element))
		if (element.type === 'Function') {
			if (element.name === 'subSup') incorporateSubSup(element as SubSupInputValue, result, settings)
			else result.push(interpretSpecialFunctionWithoutParameterAfter(element as FunctionInputValue, settings))
		}
	})
	return result
}

// Incorporate subscript/superscript into the previous term.
function incorporateSubSup(element: SubSupInputValue, result: ExpressionNode[], settings: InterpretationSettings) {
	const [sub, sup] = element.value
	const previousTerm = last(result)

	// Fix the subscript.
	if (sub) {
		if (!(previousTerm instanceof Variable)) throw new InterpretationError(`Could not interpret the subscript "${sub.value}".`, 'MisplacedSubscript', JSON.stringify(sub.value))
		result[result.length - 1] = new Variable(previousTerm.symbol, sub.value, previousTerm.accent)
	}

	// Fix the superscript.
	if (sup) {
		const base = last(result)
		if (!base) throw new InterpretationError('Could not interpret the superscript due to a missing term prior to it.', 'MisplacedSuperscript', '')
		result[result.length - 1] = new Power(base, interpretInputValueParts(sup.value, settings))
	}
}

// Interpret a function object with an external bracket argument.
function interpretSpecialFunctionWithParameterAfter(name: string, externalArgument: ExpressionNode, internalArguments: ExpressionNode[], settings: InterpretationSettings): ExpressionNode {
	const Component = getSpecialFunctionComponent(name, true)
	return new Component(externalArgument, ...internalArguments)
}

// Interpret a function object without an external bracket argument.
function interpretSpecialFunctionWithoutParameterAfter(element: FunctionInputValue, settings: InterpretationSettings): ExpressionNode {
	const { name, value } = element
	const Component = getSpecialFunctionComponent(name, false)

	// Some functions have their main argument last in the InputValue and first in the DomainValue. Shift this.
	const shiftedValue = name === 'Root' ? [last(value), ...value.slice(0, -1)] : value

	// Interpret the arguments and apply them.
	const interpretedArguments = shiftedValue.map((arg: ExpressionInputValue | undefined, index: number) => {
		if (!arg || isEmpty(arg.value)) {
			const defaultArgument = getDefaultFunctionArgument(name, index)
			if (defaultArgument) return defaultArgument
		}
		if (!arg) throw new InterpretationError(`Missing argument for function "${name}".`, 'MissingFunctionArgument', name)
		return interpretInputValueParts(arg.value, settings)
	})
	return new Component(...interpretedArguments)
}

// Get the constructor for a special function. Optionally check if it has the right settings.
function getSpecialFunctionComponent(name: string, hasParameterAfterValue?: boolean): SpecialFunctionConstructor {
	const throwError = () => { throw new InterpretationError(`Could not interpret the function "${name}".`, 'UnknownFunction', name) }
	if (!(name in specialFunctionComponents)) throwError()
	const functionSettings = specialFunctionSettings[name as SpecialFunctionName]
	if (hasParameterAfterValue !== undefined && hasParameterAfterValue !== ('hasParameterAfter' in functionSettings && !!functionSettings.hasParameterAfter)) throwError()
	const functionComponent = specialFunctionComponents[name as SpecialFunctionName]
	if (!functionComponent) throwError()
	return functionComponent as SpecialFunctionConstructor
}

// Interpret accents like dot(x) or hat(x).
function interpretAccent(element: AccentInputValue): ExpressionNode {
	const { name, value, alias } = element
	if (!isAccent(name)) throw new InterpretationError(`Could not interpret the accent "${alias}${value})". The accent name "${name}" is not known.`, 'UnknownAccent', name)
	if (value.length === 0) throw new InterpretationError(`Could not interpret the accent "${alias}${value})". It had no characters in it.`, 'EmptyAccent', name)
	if (value.length > 1) throw new InterpretationError(`Could not interpret the accent "${alias}${value})". More than one character is not supported.`, 'TooLongAccent', value)
	return new Variable(value, undefined, name as AccentName)
}

// Extract default arguments for specific special functions.
function getDefaultFunctionArgument(name: string, index: number): ExpressionNode | undefined {
	if (name === 'log' && index === 1) return Integer.ten
	if (name === 'root' && index === 1) return Integer.two
	throw new TypeError(`Invalid function argument. Could not interpret the function "${name}" since the default function for argument ${index} was not known.`)
}

function sameCursor(a: InputCursorEnd, b: InputCursorEnd): boolean {
	return a.part === b.part && a.cursor === b.cursor
}

function getExpressionPartValue(element: IntermediatePart): string {
	if (!isExpressionPart(element)) throw new Error(`Invalid case: tried to find a value of an object that was not an expression part.`)
	return element.value
}

function getPartLength(element: InputValuePart): number {
	return isExpressionPart(element) ? element.value.length : 0
}
