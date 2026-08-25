export const exerciseModes = ['solo', 'group'] as const
export type ExerciseMode = typeof exerciseModes[number]

export const exerciseReducerNameByMode = {
	solo: 'processSoloAction',
	group: 'processGroupActions',
} as const satisfies Record<ExerciseMode, string>

export function ensureExerciseMode(value: unknown): ExerciseMode {
	if (!exerciseModes.includes(value as ExerciseMode)) throw new TypeError(`Invalid exercise mode: expected one of ${exerciseModes.map(mode => `"${mode}"`).join(', ')} but received "${String(value)}".`)
	return value as ExerciseMode
}
