// The input settings are the settings that can be provided to an Expression input field. They determine what can and cannot be entered.
module.exports = {
	// Settings related to keyboards.
	basicMath: true,
	textMath: true,
	
	// Settings only targeting buttons.
	plus: true,
	minus: true,
	plusMinus: true,
	times: true,
	divide: true,
	brackets: true,
	float: true,
	greek: true,

	// Settings also checked during interpretation.
	accent: true, // Are accents allowed?
	divide: true, // Are fractions allowed?
	power: true, // Are powers allowed?
	subscript: true, // Are subscripts of variables allowed?
	trigonometry: true, // Are trigonometric functions like sin, asin, arcsin, etcetera allowed?
	root: true, // Are root-based functions like sqrt and root allowed?
	logarithm: true, // Are logarithm-based functions like log and ln allowed?
	equals: false, // Are equals signs allowed?
}
