export const exerciseFields = `
	id
	exerciseId
	mode
	parameters
	initialState
	startedAt
	active
	state
	history {
		id
		action
		state
		performedAt
	}
`

export const skillIdentityFields = `
	id
	userId
	skillId
`

export const skillLevelDataFields = `
	numPracticed
	coefficients
	coefficientsOn
	highest
	highestOn
`

export const skillExerciseDataFields = `
	exerciseData {
		exercises {
			${exerciseFields}
		}
		latestExercise {
			${exerciseFields}
		}
	}
`

export const skillLevelFields = `
	${skillIdentityFields}
	levelData {
		${skillLevelDataFields}
	}
`

export const skillExerciseFields = `
	${skillIdentityFields}
	${skillExerciseDataFields}
`

export const skillFields = (addExerciseFields: boolean): string => `
	${skillLevelFields}
	${addExerciseFields ? skillExerciseDataFields : ''}
`

export const userWithSkillsFields = (addExercises: boolean): string => `
		...UserPublicFields
		sharedData {
			...UserSharedDataFields
			skills {
				${skillFields(addExercises)}
			}
		}
		accountData {
			...UserAccountDataFields
		}
`
