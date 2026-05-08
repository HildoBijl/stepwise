export type InterpretationSettings = {
	customFunctions: boolean
	multiCharachterVariables: boolean
}

export const defaultInterpretationSettings: InterpretationSettings = {
	customFunctions: false, // Should we interpret f(x+2) as f*(x+2) (false, default) or as a custom function f with argument x+2 (true)?
	multiCharachterVariables: false, // Should we interpret 2xy as "2*x*y" or as "2*xy" with xy being a single variable?
}
