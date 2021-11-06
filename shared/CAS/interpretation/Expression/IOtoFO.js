const { isLetter, getNextSymbol } = require('../../../util/strings')
const { lastOf } = require('../../../util/arrays')
const { processOptions } = require('../../../util/objects')

const { Expression, Constant, Variable, Sum, Product, Power } = require('../../functionalities')
const { simplifyOptions, defaultInterpretationSettings } = require('../../options')

const InterpretationError = require('../InterpretationError')

const { basicFunctionComponents, advancedFunctionComponents, accents, isFunctionAllowed } = require('./functions')
const { isEmpty, getStartCursor, getEndCursor, getSubExpression, moveRight } = require('./IOsupport')

function IOtoFO(value, settings = {}) {
	settings = processOptions(settings, defaultInterpretationSettings)
	return interpretIO(value, settings)
}
module.exports = IOtoFO

function interpretIO(value, settings) {
	// Check special cases.
	if (isEmpty(value))
		throw new InterpretationError('EmptyExpression', '', `Could not interpret the Expression due to it being empty.`)

	/* Apply the various interpretation steps. There are four steps.
	 * - Interpret brackets, including functions with parameters after them. Think of splitting "2x*5sin(3+4)" into parts "2x*5" and a sine function with "3+4" within.
	 * - Interpret sums. Think of splitting "3+4" into "sum("3", "4")".
	 * - Interpret products. Think of splitting up "2x*5" into "product("2x", "5")".
	 * - Interpret remaining matters. Think of turning "2x" into "product(2, x)", turning functions without a parameter after it like "sqrt(y)" into an actual function, and processing subscripts/superscripts, incorporating them into the parameter prior to them.
	 * Each step calls the next one, so only the first step is activated here.
	 */
	return interpretBrackets(value, settings)
}

// interpretBrackets interprets everything related to brackets. This includes both regular brackets 2*(3+4), brackets with simple functions sin(2*x) and brackets for advanced functions with a parameter after it like [10]log(2*x).
function interpretBrackets(value, settings) {
	const bracketSets = getMatchingBrackets(value)
	const result = []

	// Walk through the matching brackets and add each part accordingly.
	let lastPosition = getStartCursor(value)
	bracketSets.forEach(bracketSet => {
		const { opening, closing } = bracketSet

		// If the opening bracket is due to an advanced function, interpret the part before it and the function itself directly.
		const start = lastPosition
		const end = { ...opening }
		if (value[opening.part].type === 'Function') {
			// Interpret the part prior to the function.
			end.part--
			end.cursor = value[end.part].length
			result.push(...getSubExpression(value, start, end))

			// Verify the advanced function.
			if (!isFunctionAllowed(name, settings))
				throw new InterpretationError(`UnknownAdvancedFunction`, name, `Could not interpret the function "${name}".`)
			if (!advancedFunctionComponents[name])
				throw new Error(`Invalid function name: the function "${name}" was allowed by the isFunctionAllowed function, but it does not have a known component.`)
			if (!advancedFunctionComponents[name].hasParameterAfter)
				throw new Error(`Invalid function processing: tried to process a function "${name}" as a function with a parameter after, but this function does not have a parameter afterwards.`)

			// Interpret the advanced function.
			const { name, value: internalArguments } = value[opening.part]
			const shiftedOpening = { part: opening.part + 1, cursor: 0 }
			const externalArgument = interpretIO(getSubExpression(value, shiftedOpening, closing))
			const Component = advancedFunctionComponents[name].component
			result.push(new Component(
				...internalArguments.map(expression => interpretIO(expression.value, settings)),
				externalArgument
			))

			// Finally shift the position to after the closing bracket.
			return lastPosition = moveRight(closing)
		}

		// Interpret the part between brackets.
		const shiftedOpening = moveRight(opening)
		const partBetweenBrackets = getSubExpression(value, shiftedOpening, closing)
		const interpretedExpression = interpretIO(partBetweenBrackets, settings)

		// When there is no special function, find the letters prior to the bracket. These may be the function name for a basic or custom function.
		const str = value[end.part].value
		let movingCursor = end.cursor
		while (isLetter(str[movingCursor - 1]))
			movingCursor--
		const functionName = str.substring(movingCursor, end.cursor)

		// If the function name is in the allowed function list, add it.
		if (isFunctionAllowed(functionName, settings)) {
			// Add the part prior to the brackets and prior to the function name.
			end.cursor -= functionName.length
			result.push(...getSubExpression(value, start, end))

			// Verify the basic function.
			if (!isFunctionAllowed(functionName, settings))
				throw new InterpretationError(`UnknownBasicFunction`, functionName, `Could not interpret the function "${functionName}".`)
			if (!basicFunctionComponents[functionName])
				throw new Error(`Invalid function name: the function "${functionName}" was allowed by the isFunctionAllowed function, but it does not have a known component.`)

			// Finally add the basic function itself.
			const Component = basicFunctionComponents[functionName]
			result.push(new Component(interpretedExpression))
			return lastPosition = moveRight(closing)
		}

		if (settings.customFunctions && functionName.length > 0) {
			throw new Error(`Invalid input field settings: custom functions are not yet supported. This must still be programmed in the future.`)
		}

		// It is a regular bracket. Just add the part prior to the brackets and the part inside the brackets, and we're done.
		result.push(...getSubExpression(value, start, end))
		result.push(interpretedExpression)
		return lastPosition = moveRight(closing)
	})

	// Add the remaining part of the expression.
	const end = getEndCursor(value)
	result.push(...getSubExpression(value, lastPosition, end))

	// With brackets taken care of, continue with sums.
	return interpretSums(result)
}

// getMatchingBrackets returns an array [{ opening: { part: 0, cursor: 4 }, closing: { part: 2, cursor: 0 } }, ... ] with matching brackets. Brackets inside these brackets are ignored (assuming they match).
function getMatchingBrackets(value) {
	// Set up a bracket list that will be filled.
	const brackets = []
	let level = 0
	const noteOpeningBracket = (position) => {
		if (level === 0)
			brackets.push({ opening: position })
		level++
	}
	const noteClosingBracket = (position) => {
		if (level === 0)
			throw new InterpretationError('UnmatchedClosingBracket', position, `Could not interpret the expression due to a missing opening bracket.`)
		if (level === 1)
			lastOf(brackets).closing = position
		level--
	}

	// Walk through the expression parts, keeping track of opening brackets.
	value.forEach((element, part) => {
		// On a function with a parameter afterwards, like [10]log(, note the opening bracket.
		if (element.type === 'Function') {
			const { name } = element
			if (advancedFunctionComponents[name].hasParameterAfter)
				noteOpeningBracket({ part })
		}

		// With the above checked, only expression parts can have relevant brackets. Ignore other element types.
		if (element.type !== 'ExpressionPart')
			return

		// Walk through the brackets in this expression part.
		const str = element.value
		const getNextBracket = (fromPosition = -1) => getNextSymbol(str, ['(', ')'], fromPosition + 1)
		for (let nextBracket = getNextBracket(); nextBracket !== -1; nextBracket = getNextBracket(nextBracket)) {
			const bracketPosition = { part, cursor: nextBracket }
			if (str[nextBracket] === '(')
				noteOpeningBracket(bracketPosition)
			else
				noteClosingBracket(bracketPosition)
		}
	})

	// Check that all brackets have been closed.
	if (level > 0) {
		const bracketPosition = lastOf(brackets).opening
		throw new InterpretationError('UnmatchedOpeningBracket', bracketPosition, `Could not interpret the expression part due to a missing closing bracket.`)
	}

	// All good. Return the result.
	return brackets
}

// interpretSums interprets pluses and minuses. It assumes there are no brackets left.
function interpretSums(value, settings) {
	// Set up a handler to add terms to the sum.
	const sumTerms = []
	let lastSymbol = ''
	const addTerm = (start, end) => {
		// Don't add things if the start and the end collide. (Like with a minus at the start of "-3x".)
		if (start.part === end.part && start.cursor === end.cursor)
			return

		// Extract the expression and check if it needs a minus sign.
		let interpretedExpression = interpretProducts(getSubExpression(value, start, end), settings)
		if (lastSymbol === '-')
			interpretedExpression = interpretedExpression.applyMinus()
		sumTerms.push(interpretedExpression)
	}

	// Walk through all expression parts, find pluses and minuses, and split the expressions up there.
	let start = getStartCursor(value)
	value.forEach((element, part) => {
		// Only consider ExpressionParts
		if (element.type !== 'ExpressionPart')
			return

		// Walk through the plus/minuses and process the resulting parts.
		const str = element.value
		const getNextPlusMinus = (startFrom = -1) => getNextSymbol(str, ['+', '-'], startFrom + 1)
		for (let nextPlusMinus = getNextPlusMinus(); nextPlusMinus !== -1; nextPlusMinus = getNextPlusMinus(nextPlusMinus)) {
			const currentSymbol = str[nextPlusMinus]
			const end = { part, cursor: nextPlusMinus }

			// Check that there is no plus at the start.
			if (end.part === 0 && end.cursor === 0 && currentSymbol === '+')
				throw new InterpretationError('PlusAtStart', '+', `Could not interpret the Expression due to it starting with a plus.`)

			// Check that there are not two consecutive pluses/minuses, although "+-" like in "x+-3" is allowed.
			if (start.part === end.part && start.cursor === end.cursor) {
				if (lastSymbol === '-' || currentSymbol === '+')
					throw new InterpretationError('DoublePlusMinus', `${lastSymbol}${currentSymbol}`, `Could not interpret the Expression due to a double plus/minus.`)
			}

			// Check if there is a minus sign preceded by a times. In that case ignore it here and incorporate the minus when dealing with the product.
			if (currentSymbol === '-' && str[nextPlusMinus - 1] === '*')
				continue

			// Extract the expression from the last plus or minus and interpret it.
			addTerm(start, end)

			// Store parameters for the next iteration.
			lastSymbol = currentSymbol
			start = moveRight(end)
		}
	})

	// Check for a plus or minus at the end. If it's not there, add the remaining part.
	const end = getEndCursor(value)
	if (start.part === end.part && start.cursor === end.cursor && lastSymbol)
		throw new InterpretationError('PlusMinusAtEnd', lastSymbol, `Could not interpret the Expression due to it ending with "${lastSymbol}".`)
	addTerm(start, end)

	// Assemble all terms in a sum.
	if (sumTerms.length === 0)
		throw new Error(`Sum interpreting error: We wound up with an empty sum, which should never happen.`)
	if (sumTerms.length === 1)
		return sumTerms[0]
	return new Sum(sumTerms).simplify(simplifyOptions.structureOnly)
}

// interpretProducts takes a partially interpreted expression without any brackets, pluses or minuses and interprets it.
function interpretProducts(value, settings) {
	// Set up a handler to add factors to the product.
	const productFactors = []
	const addFactor = (start, end) => {
		// Add the factor to the product. If there is a minus at the start of this term, like in "3*-5", then apply this: move the start cursor one to the right and multiply the result by minus one.
		const minusAfterTimes = (value[start.part].value[start.cursor] === '-')
		if (minusAfterTimes)
			start = moveRight(start)
		let interpretedExpression = interpretRemaining(getSubExpression(value, start, end), settings)
		if (minusAfterTimes)
			interpretedExpression = interpretedExpression.applyMinus()
		productFactors.push(interpretedExpression)
	}

	// Walk through all expression parts, find times operators, and split the expressions up there.
	let start = getStartCursor(value)
	value.forEach((element, part) => {
		// Only consider ExpressionParts
		if (element.type !== 'ExpressionPart')
			return

		// Walk through the times operators and process the resulting parts.
		const str = element.value
		const getNextTimes = (startFrom = -1) => str.indexOf('*', startFrom + 1)
		for (let nextTimes = getNextTimes(); nextTimes !== -1; nextTimes = getNextTimes(nextTimes)) {
			const end = { part, cursor: nextTimes }

			// Check that there is no times at the start.
			if (end.part === 0 && end.cursor === 0)
				throw new InterpretationError('TimesAtStart', '*', `Could not interpret the Expression due to it starting with a times operator.`)

			// Check that there are not two consecutive times operators.
			if (start.part === end.part && start.cursor === end.cursor)
				throw new InterpretationError('DoubleTimes', '**', `Could not interpret the Expression due to a double times operator.`)

			// Extract the expression from the last times operator and interpret it.
			addFactor(start, end)
			start = moveRight(end)
		}
	})

	// Check for a times operator at the end. If it's not there, add the remaining part.
	const end = getEndCursor(value)
	if (start.part === end.part && start.cursor === end.cursor)
		throw new InterpretationError('TimesAtEnd', '*', `Could not interpret the Expression due to it ending with a times operator.`)
	addFactor(start, end)

	// Assemble all factors in a product.
	if (productFactors.length === 0)
		throw new Error(`Product interpreting error: We wound up with an empty product, which should never happen.`)
	if (productFactors.length === 1)
		return productFactors[0]
	return new Product(productFactors).simplify(simplifyOptions.structureOnly)
}

// interpretRemaining interprets expressions without any brackets, pluses/minuses and times operators.
function interpretRemaining(value, settings) {
	// Turn all ExpressionParts (strings) into arrays of interpreted elements. (Keep other elements, interpreted or not, as they are.)
	value = value.map(element => (element.type === 'ExpressionPart' ? interpretString(element.value, settings) : element)).flat()

	// Interpret the remaining elements. This needs to be done after the interpreting of strings, in case of SubSups that need merging. Then turn the result into one big product.
	value = interpretElements(value, settings)
	return new Product(value).simplify(simplifyOptions.structureOnly)
}

// interpretString takes a string and interprets it, returning an array of elements. For instance, a2.3bc will return [a, 2.3, b, c], where the array elements are constants, variables and such. The string may not have numbers or times operators anymore.
const regInvalidSymbols = new RegExp(`[^a-zα-ω0-9.]`, 'i')
const regSingleDecimalSeparator = new RegExp(`(([^0-9]\\.[^0-9])|(^\\.[^0-9])|([^0-9]\\.$))`) // Period without any numbers.
const regMultipleDecimalSeparator = new RegExp(`\\.[0-9]*\\.`) // Number with two periods.
function interpretString(str, settings) {
	// Check the string format.
	const invalidSymbolMatch = str.match(regInvalidSymbols)
	if (invalidSymbolMatch)
		throw new InterpretationError('InvalidSymbol', invalidSymbolMatch[0], `Could not interpret the string "${str}".`)

	const singleDecimalSeparatorMatch = str.match(regSingleDecimalSeparator)
	if (singleDecimalSeparatorMatch)
		throw new InterpretationError('SingleDecimalSeparator', singleDecimalSeparatorMatch[0], `Could not interpret the string "${str}".`)

	const multipleDecimalSeparatorMatch = str.match(regMultipleDecimalSeparator)
	if (multipleDecimalSeparatorMatch)
		throw new InterpretationError('MultipleDecimalSeparator', multipleDecimalSeparatorMatch[0], `Could not interpret the string "${str}".`)

	// All seems fine. Interpret the string. For this, walk through the string, add every individual letter as variable and every group of digits as constant (Integer or Float).
	let lastLetter = -1
	const terms = []
	for (let i = 0; i < str.length; i++) {
		if (isLetter(str[i])) {
			if (lastLetter < i - 1)
				terms.push(Constant.interpret(str.substring(lastLetter + 1, i)))
			terms.push(new Variable(str[i]))
			lastLetter = i
		}
	}

	// If the end was a number, add this number too.
	if (lastLetter < str.length - 1)
		terms.push(Constant.interpret(str.substring(lastLetter + 1)))

	// All done. Return the corresponding elements.
	return terms
}

// interpretElements takes an array of elements, some already interpreted and some not yet. It interprets all non-interpreted elements.
function interpretElements(value, settings) {
	const result = []
	value.forEach(element => {
		// If the element has already been interpreted, keep it.
		if (element instanceof Expression)
			return result.push(element)

		// Check for functions. (These should only be functions without a parameter after. Functions with a parameter after have already been interpreted when interpreting brackets.) SubSups have a more complex interpretation.
		if (element.type === 'Function') {
			if (element.name === 'subSup')
				return incorporateSubSup(element, result, settings)
			return result.push(interpretFunction(element, settings))
		}

		// Check for accents.
		if (element.type === 'Accent')
			return result.push(interpretAccent(element, settings))
	})

	// All done!
	return result
}

// incorporateSubSup takes a SubSup IO element and a results array and tries to incorporate the SubSup into the given result array. It does this by adjusting the result array. It does not return anything.
function incorporateSubSup(element, result, settings) {
	const [sub, sup] = element.value
	const previousTerm = lastOf(result)

	// First incorporate the subscript.
	if (sub) {
		// On a subscript, the previous element must be a variable.
		if (!(previousTerm instanceof Variable))
			throw new InterpretationError(`MisplacedSubscript`, sub.value, `Could not interpret the subscript "${sub.value}".`)

		// Apply the subscript.
		previousTerm.subscript = sub.value
	}

	// Then interpret and add the superscript.
	if (sup) {
		// There must be a previous term.
		if (!previousTerm)
			throw new InterpretationError(`MisplacedSuperscript`, '', `Could not interpret the superscript due to a missing term prior to it.`)

		// Interpret the exponent and apply it in a power.
		const exponent = interpretIO(sup.value, settings)
		result[result.length - 1] = new Power(previousTerm, exponent)
	}
}

// interpretFunction interprets a function object. This only works for functions that do not have a parameter afterwards, like [10]log(...).
function interpretFunction(element, settings) {
	const { name, value } = element

	// Verify the advanced function.
	if (!isFunctionAllowed(name, settings))
		throw new InterpretationError(`UnknownAdvancedFunction`, name, `Could not interpret the function "${name}".`)
	if (!advancedFunctionComponents[name])
		throw new Error(`Invalid function name: the function "${name}" was allowed by the isFunctionAllowed function, but it does not have a known component.`)
	if (advancedFunctionComponents[name].hasParameterAfter)
		throw new Error(`Invalid function processing: tried to process a function "${name}" as a parameterless function, but this function has a parameter afterwards.`)

	// Process the arguments and assemble the function.
	const Component = advancedFunctionComponents[name].component
	const valueInterpreted = value.map(arg => interpretIO(arg.value, settings))
	return new Component(...valueInterpreted)
}

// interpretAccent interprets an accent object.
function interpretAccent(element, settings) {
	const { name, value, alias } = element

	// Verify the input.
	if (!accents.includes(name))
		throw new InterpretationError('UnknownAccent', name, `Could not interpret the accent "${alias}${value})" with type "${type}".`)
	if (value.length === 0)
		throw new InterpretationError('EmptyAccent', name, `Could not interpret the accent "${alias}${value})" with type "${type}".`)
	if (value.length > 2)
		throw new InterpretationError('TooLongAccent', value, `Could not interpret the accent "${alias}${value})" with type "${type}".`)

	// Process the input.
	return new Variable({
		symbol: value,
		accent: name,
	})
}