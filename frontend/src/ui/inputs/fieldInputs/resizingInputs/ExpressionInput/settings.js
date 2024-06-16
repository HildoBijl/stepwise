// Below are several commonly used objects for the allow setting for Expression input fields.

// The following are subgroups that can be added in.
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

// The following are more complete setting objects.
const elementary = {
	...noFunctions,
	...noPowers,
	...simpleVariables,
	greek: false,
	float: false,
	divide: false,
}

const withFractions = {
	...elementary,
	divide: true,
}

const polynomes = {
	...elementary,
	power: true,
}

const rational = {
	...polynomes,
	divide:  true,
}

const withRoots = {
	...rational,
	roots: true,
}

const basicTrigonometry = {
	...withRoots,
	trigonometry: true,
	greek: true,
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

export { noFunctions, noPowers, simpleVariables, elementary, withFractions, polynomes, rational, withRoots, basicTrigonometry, basicTrigonometryInDegrees, allMathSimpleVariables }
