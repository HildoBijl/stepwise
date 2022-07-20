// The interpretation settings determine how an Expression is interpreted.
module.exports = {
	customFunctions: false, // Should we interpret f(x+2) as f*(x+2) (false, default) or as a custom function f with argument x+2 (true)? [ToDo: implement custom functions in input fields when needed.]
}
