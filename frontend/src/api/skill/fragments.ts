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

export const skillLatestExerciseDataFields = `
	exerciseData {
		latestExercise {
			${exerciseFields}
		}
	}
`

export const skillExerciseHistoryDataFields = `
	exerciseData {
		exercises {
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

export const skillLatestExerciseFields = `
	${skillIdentityFields}
	${skillLatestExerciseDataFields}
`

export const skillWithExerciseHistoryFields = `
	${skillLevelFields}
	${skillExerciseHistoryDataFields}
`

export const userWithSkillsFields = `
		...UserPublicFields
		sharedData {
			...UserSharedDataFields
			skills {
				${skillWithExerciseHistoryFields}
			}
		}
		accountData {
			...UserAccountDataFields
		}
`
