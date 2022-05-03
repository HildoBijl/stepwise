// The interpretation settings determine what is and isn't allowed during interpretation. They are usually derived from the input field settings. These are the default values.
module.exports = {
	divide: true, // Are fractions allowed?
	power: true, // Are powers allowed?
	subscript: true, // Are subscripts of variables allowed?
	trigonometry: true, // Are trigonometric functions like sin, asin, arcsin, etcetera allowed?
	root: true, // Are root-based functions like sqrt and root allowed?
	logarithm: true, // Are logarithm-based functions like log and ln allowed?
	customFunctions: false, // Should we interpret f(x+2) as f*(x+2) (false, default) or as a custom function f with argument x+2 (true)? [ToDo: implement custom functions in input fields when needed.]
}
