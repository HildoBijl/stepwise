export const exerciseModes = ['solo', 'group'] as const
export type ExerciseMode = typeof exerciseModes[number]

export const exerciseReducerNameByMode = {
	solo: 'processSoloAction',
	group: 'processGroupActions',
} as const satisfies Record<ExerciseMode, string>
