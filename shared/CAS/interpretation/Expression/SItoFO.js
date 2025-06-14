const { isLetter, getNextSymbol, lastOf, processOptions, filterOptions, InterpretationError } = require('../../../util')

const { Expression, Constant, Variable, Sum, Product, Power, PlusMinus } = require('../../functionalities')
const { defaultFieldSettings, defaultExpressionSettings } = require('../../options')

const { isEmpty, getStartCursor, getEndCursor, getSubExpression, moveRight } = require('../support')
const { getMatchingBrackets } = require('../characterLocalization')
const { basicFunctionComponents, advancedFunctionComponents, accents, isFunctionAllowed } = require('../functions')

function SItoFO(value, settings = {}) {
	settings = processOptions(settings, defaultFieldSettings)
	return interpretSI(value, settings)
}
module.exports = SItoFO

function interpretSI(value, settings) {
	// On an empty expression, throw an error. Nothing is known.
	if (isEmpty(value))
		throw new InterpretationError('EmptyExpression', undefined, `Could not interpret an empty Expression.`)

	/* Apply the various interpretation steps. There are four steps.
	* - Interpret brackets, including functions with parameters after them. Think of splitting "2x*5sin(3+4)" into parts "2x*5" and a sine function with "3+4" within.
	* - Interpret sums. Think of splitting "3+4" into "sum("3", "4")".
	* - Interpret products. Think of splitting up "2x*5" into "product("2x", "5")".
	* - Interpret remaining matters. Think of turning "2x" into "product(2, x)", turning functions without a parameter after it like "sqrt(y)" into an actual function, and processing subscripts/superscripts, incorporating them into the parameter prior to them.
	* Each step calls the next one, so only the first step is activated here.
	*/
	const obj = interpretBrackets(value, settings)

	// Apply any extra settings related to the Expression to it.
	return obj.applySettings(filterOptions(settings, defaultExpressionSettings))
}

// interpretBrackets interprets everything related to brackets. This includes both regular brackets 2*(3+4), brackets with simple functions sin(2*x) and brackets for advanced functions with a parameter after it like log[10](2*x).
function interpretBrackets(value, settings) {
	const bracketSets = getMatchingBrackets(value)
	const result = []

	// Walk through the matching brackets and add each part accordingly.
	let lastPosition = getStartCursor(value)
	bracketSets.forEach(bracketSet => {
		const { opening, closing } = bracketSet

		// If the opening bracket is due to an advanced function, interpret the part before it and the function itself directly.
		const end = { ...opening }
		if (value[opening.part].type === 'Function') {
			// Interpret the part prior to the function.
			end.part--
			end.cursor = value[end.part].length
			result.push(...getSubExpression(value, lastPosition, end))

			// Verify the advanced function.
			const { name, value: internalArguments } = value[opening.part]
			if (!isFunctionAllowed(name, settings))
				throw new InterpretationError(`UnknownAdvancedFunction`, name, `Could not interpret the function "${name}".`)
			if (!advancedFunctionComponents[name])
				throw new Error(`Invalid function name: the function "${name}" was allowed by the isFunctionAllowed function, but it does not have a known component.`)
			if (!advancedFunctionComponents[name].hasParameterAfter)
				throw new Error(`Invalid function processing: tried to process a function "${name}" as a function with a parameter after, but this function does not have a parameter afterwards.`)

			// Interpret the advanced function.
			const shiftedOpening = { part: opening.part + 1, cursor: 0 }
			const externalArgument = interpretSI(getSubExpression(value, shiftedOpening, closing), settings)
			const Component = advancedFunctionComponents[name].component
			result.push(new Component(
				externalArgument,
				...internalArguments.map(expression => interpretSI(expression.value, settings)),
			))

			// Finally shift the position to after the closing bracket.
			return lastPosition = moveRight(closing)
		}

		// Interpret the part between brackets.
		const partBetweenBrackets = getSubExpression(value, moveRight(opening), closing)
		const interpretedExpression = interpretSI(partBetweenBrackets, settings)

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
			result.push(...getSubExpression(value, lastPosition, end))

			// Verify the basic function.
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
		result.push(...getSubExpression(value, lastPosition, end))
		result.push(interpretedExpression)
		return lastPosition = moveRight(closing)
	})

	// Add the remaining part of the expression.
	const end = getEndCursor(value)
	result.push(...getSubExpression(value, lastPosition, end))

	// With brackets taken care of, continue with sums.
	return interpretSums(result, settings)
}

// interpretSums interprets pluses and minuses. It assumes there are no brackets left.
function interpretSums(value, settings) {
	// Set up a handler to add terms to the sum.
	const sumTerms = []
	let symbolBefore = ''
	const addTerm = (start, end, symbolBefore) => {
		// Don't add things if the start and the end collide. (Like with a minus at the start of "-3x".)
		if (start.part === end.part && start.cursor === end.cursor)
			return

		// Extract the expression and check if it needs a minus or plus/minus sign.
		let interpretedExpression = interpretProducts(getSubExpression(value, start, end), settings)
		if (symbolBefore === '-')
			interpretedExpression = interpretedExpression.applyMinus(false)
		else if (symbolBefore === '±')
			interpretedExpression = interpretedExpression.multiply(new PlusMinus(), true)
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
		const getNextPlusMinus = (startFrom = -1) => getNextSymbol(str, ['+', '-', '±'], startFrom + 1)
		for (let nextPlusMinus = getNextPlusMinus(); nextPlusMinus !== -1; nextPlusMinus = getNextPlusMinus(nextPlusMinus)) {
			let symbolAfter = str[nextPlusMinus]
			let end = { part, cursor: nextPlusMinus }

			// Check that there is no plus at the start.
			if (end.part === 0 && end.cursor === 0 && symbolAfter === '+')
				throw new InterpretationError('PlusAtStart', '+', `Could not interpret the Expression due to it starting with a plus.`)

			// Check that there are not two consecutive pluses/minuses, although "+-" like in "x+-3" is allowed.
			if (start.part === end.part && start.cursor === end.cursor) {
				if (symbolBefore === symbolAfter || symbolAfter === '+')
					throw new InterpretationError('DoublePlusMinus', `${symbolBefore}${symbolAfter}`, `Could not interpret the Expression due to a double plus/minus.`)
			}

			// If we have "2+-3" or "2±-3" or "2-±3" or similar, then jump over the second plus/minus character and incorporate it into the string to be interpreted.
			if (start.part === end.part && start.cursor === end.cursor) {
				nextPlusMinus = getNextPlusMinus(nextPlusMinus)
				if (nextPlusMinus === -1)
					break
				symbolAfter = str[nextPlusMinus]
				end = { part, cursor: nextPlusMinus }
			}

			// Check if there is a minus sign or plus/minus preceded by a times. In that case ignore it here and incorporate the minus when dealing with the product.
			if ((symbolAfter === '-' || symbolAfter === '±') && str[nextPlusMinus - 1] === '*')
				continue

			// Extract the expression from the last plus or minus and interpret it.
			addTerm(start, end, symbolBefore)

			// Store parameters for the next iteration.
			symbolBefore = symbolAfter
			start = moveRight(end)
		}
	})

	// Check for a plus or minus at the end. If it's not there, add the remaining part.
	const end = getEndCursor(value)
	if (start.part === end.part && start.cursor === end.cursor && symbolBefore)
		throw new InterpretationError('PlusMinusAtEnd', symbolBefore, `Could not interpret the Expression due to it ending with "${symbolBefore}".`)
	addTerm(start, end, symbolBefore)

	// Assemble all terms in a sum.
	if (sumTerms.length === 0)
		throw new Error(`Sum interpreting error: We wound up with an empty sum, which should never happen.`)
	if (sumTerms.length === 1)
		return sumTerms[0]
	return new Sum(sumTerms).cleanStructure()
}

// interpretProducts takes a partially interpreted expression without any brackets, pluses or minuses and interprets it.
function interpretProducts(value, settings) {
	// Set up a handler to add factors to the product.
	const productFactors = []
	const addFactor = (start, end) => {
		// Add the factor to the product. If there is a minus at the start of this term, like in "3*-5", then apply this: move the start cursor one to the right and multiply the result by minus one. Or identically with a plus/minus "3*±5" do the same.
		const firstChar = value[start.part].value[start.cursor]
		const minusAfterTimes = (firstChar === '-' || firstChar === '±')
		if (minusAfterTimes)
			start = moveRight(start)
		let interpretedExpression = interpretRemaining(getSubExpression(value, start, end), settings)
		if (minusAfterTimes)
			interpretedExpression = (firstChar === '-' ? interpretedExpression.applyMinus() : interpretedExpression.multiply(new PlusMinus(), true))
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
	return new Product(productFactors).cleanStructure()
}

// interpretRemaining interprets expressions without any brackets, pluses/minuses and times operators.
function interpretRemaining(value, settings) {
	// Turn all ExpressionParts (strings) into arrays of interpreted elements. (Keep other elements, interpreted or not, as they are.)
	value = value.map(element => (element.type === 'ExpressionPart' ? interpretString(element.value, settings) : element)).flat()

	// Interpret the remaining elements. This needs to be done after the interpreting of strings, in case of SubSups that need merging. Then turn the result into one big product.
	value = interpretElements(value, settings)
	return new Product(value).cleanStructure()
}

// interpretString takes a string and interprets it, returning an array of elements. For instance, a2.3bc will return [a, 2.3, b, c], where the array elements are constants, variables and such. The string may not have numbers or times operators anymore.
const regInvalidSymbols = new RegExp(`[^a-zα-ω0-9.∞]`, 'i')
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
		if (isLetter(str[i]) || str[i] === '∞') {
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

// incorporateSubSup takes a SubSup SI element and a results array and tries to incorporate the SubSup into the given result array. It does this by adjusting the result array. It does not return anything.
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
		const exponent = interpretSI(sup.value, settings)
		result[result.length - 1] = new Power(previousTerm, exponent)
	}
}

// interpretFunction interprets a function object. This only works for functions like "root[3](8)" that do not have a parameter afterwards, and not for functions like log[10](...) that do.
function interpretFunction(element, settings) {
	const { name, value } = element

	// Verify the advanced function.
	if (!isFunctionAllowed(name, settings))
		throw new InterpretationError(`UnknownAdvancedFunction`, name, `Could not interpret the function "${name}". It is not allowed for the given settings "${JSON.stringify(settings)}".`)
	if (!advancedFunctionComponents[name])
		throw new Error(`Invalid function name: the function "${name}" was allowed by the isFunctionAllowed function, but it does not have a known component.`)
	if (advancedFunctionComponents[name].hasParameterAfter)
		throw new Error(`Invalid function processing: tried to process a function "${name}" as a parameterless function, but this function has a parameter afterwards.`)

	// If the component has its main argument last, like root[3](8), then bring this last argument to the front, as expected by the CAS.
	const Component = advancedFunctionComponents[name].component
	const valueShifted = Component.hasMainArgumentLast ? [lastOf(value), ...value.slice(0, -1)] : value

	// Process the arguments. If an argument is missing, and if it's specifically mentioned that it's not obligatory, use a default value.
	const valueInterpreted = valueShifted.map((arg, index) => {
		if (isEmpty(arg.value) && Component.obligatory && !Component.obligatory[index]) {
			const defaultArgs = Component.getDefaultSO()
			const argName = Component.args[index]
			return defaultArgs[argName]
		}
		return interpretSI(arg.value, settings)
	})

	// Assemble the function.
	return new Component(...valueInterpreted)
}

// interpretAccent interprets an accent object.
function interpretAccent(element, settings) {
	const { name, value, alias } = element

	// Verify the input.
	if (!accents.includes(name))
		throw new InterpretationError('UnknownAccent', name, `Could not interpret the accent "${alias}${value})". The accent name "${name}" is not known.`)
	if (value.length === 0)
		throw new InterpretationError('EmptyAccent', name, `Could not interpret the accent "${alias}${value})". It had no characters in it.`)
	if (value.length > 1)
		throw new InterpretationError('TooLongAccent', value, `Could not interpret the accent "${alias}${value})". More than one characters is not supported.`)

	// Process the input.
	return new Variable({
		symbol: value,
		accent: name,
	})
}