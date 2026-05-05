export type InterpretationSettings = {
	customFunctions: boolean
}

export const defaultInterpretationSettings: InterpretationSettings = {
	customFunctions: false, // Should we interpret f(x+2) as f*(x+2) (false, default) or as a custom function f with argument x+2 (true)?
}
