export const groupExerciseFields = `
	__typename
	id
	skillId
	exerciseId
	mode
	parameters
	initialState
	active
	startedAt
	state
	history {
		id
		performedAt
		state
		actions {
			id
			userId
			performedAt
			action
		}
	}
`
