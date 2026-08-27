export const skillFields = (addExerciseFields) => `
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
	... on SkillWithExercises {
		exercises {
			${exerciseFields}
		}
		activeExercise {
			${exerciseFields}
		}
	}` : ``}
`

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
