import { mergeDefaults } from '@step-wise/utils'

export const defaultInterpretationSettings = {
	eAsConstant: true, // Should e be interpreted as the named constant (Euler's number)? Or as regular variable e?
	logarithms: true, // Should ln(x) be interpreted as the natural logarithm function, or as l*n*(x)?
	trigonometry: true, // Should sin(x) be interpreted as the sine function, or as s*i*n*(x)?
	multiCharacterVariables: false, // Should we interpret 2xy as "2*x*y" or as "2*xy" with xy being a single variable?

	// To implement in the future.
	// customFunctions: false, // Should we interpret f(x+2) as f*(x+2) (false, default) or as a custom function f with argument x+2 (true)?
	// derivatives: false, // Should we interpret df(x)/dx as (d*f)*x/(d*x) or as a derivative? And same for (d/dx)f(x).
}

export type InterpretationSettings = typeof defaultInterpretationSettings
export type InterpretationSettingsInput = Partial<InterpretationSettings>

export function asInterpretationSettings(settings: InterpretationSettingsInput): InterpretationSettings {
	return mergeDefaults(settings, defaultInterpretationSettings)
}
