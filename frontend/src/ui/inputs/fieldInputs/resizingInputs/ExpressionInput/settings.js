// Below are several commonly used objects for the allow setting for Expression input fields.

// The following are subgroups that can be added in.
export const noFunctions = {
	trigonometry: false,
	logarithm: false,
}
export const noPowers = {
	power: false,
	root: false,
}
export const simpleVariables = {
	subscript: false,
	accent: false,
}

// The following are more complete setting objects.
export const elementary = {
	...noFunctions,
	...noPowers,
	...simpleVariables,
	basicMath: true,
	textMath: true,
	greek: false,
	float: false,
	divide: false,
	plusMinus: false,
}

export const withFractions = {
	...elementary,
	divide: true,
}

export const polynomes = {
	...elementary,
	power: true,
}

export const rational = {
	...polynomes,
	divide:  true,
}

export const withRoots = {
	...rational,
	root: true,
}

export const basicTrigonometry = {
	...withRoots,
	trigonometry: true,
	greek: true,
}

export const basicTrigonometryInDegrees = {
	...basicTrigonometry,
	useDegrees: true,
}

export const allMathSimpleVariables = {
	...simpleVariables,
	greek: false,
	float: false,
}

// The following are adjustments for numeric situations.
export const numericElementary = {
	...elementary,
	textMath: false,
}

export const numericWithFractions = {
	...elementary,
	textMath: false,
}

export const numericWithPowers = {
	...elementary,
	textMath: false,
}

export const numericRational = {
	...rational,
	textMath: false,
}

export const numericWithRoots = {
	...withRoots,
	textMath: false,
}
