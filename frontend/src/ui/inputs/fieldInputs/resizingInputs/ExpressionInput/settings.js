// Below are several commonly used objects for the allow setting for Expression input fields.

const noFunctions = {
	trigonometry: false,
	logarithm: false,
}

const noPowers = {
	power: false,
	root: false,
}

const simpleVariables = {
	subscript: false,
	accent: false,
}

const basicMath = {
	...noFunctions,
	...noPowers,
	...simpleVariables,
	greek: false,
	float: false,
}

const basicMathNoFractions = {
	...basicMath,
	divide: false,
}

const basicMathAndPowers = {
	...noFunctions,
	...simpleVariables,
	greek: false,
	float: false,
}

const basicTrigonometry = {
	...basicMath,
	trigonometry: true,
	greek: true,
	root: true,
	power: true,
}

const basicTrigonometryInDegrees = {
	...basicTrigonometry,
	useDegrees: true,
}

const allMathSimpleVariables = {
	...simpleVariables,
	greek: false,
	float: false,
}

export { noFunctions, noPowers, simpleVariables, basicMath, basicMathNoFractions, basicMathAndPowers, basicTrigonometry, basicTrigonometryInDegrees, allMathSimpleVariables }
