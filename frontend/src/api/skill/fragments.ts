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

export const skillFields = (addExerciseFields: boolean): string => `
	id
	userId
	skillId
	numPracticed
	coefficients
	coefficientsOn
	highest
	highestOn
	createdAt
	updatedAt
	${addExerciseFields ? `
	exerciseData {
		exercises {
			${exerciseFields}
		}
		activeExercise {
			${exerciseFields}
		}
	}` : ``}
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
