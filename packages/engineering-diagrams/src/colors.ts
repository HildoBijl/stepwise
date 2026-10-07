export type EngineeringLoadSource = 'input' | 'external' | 'reaction' | 'section'

export interface EngineeringDiagramColors extends Record<EngineeringLoadSource, string> {
	default: string
	feedback: {
		success: string
		error: string
		warning: string
		info: string
	}
	glow: string
}

export const defaultEngineeringDiagramColors: EngineeringDiagramColors = Object.freeze({
	default: '#000000',
	input: '#b1a304',
	external: '#8e0b0b',
	reaction: '#043870',
	section: '#902dba',
	feedback: Object.freeze({
		success: '#0d8042',
		error: '#bd0f0f',
		warning: '#d66c00',
		info: '#044488',
	}),
	glow: '#0d8042',
})
