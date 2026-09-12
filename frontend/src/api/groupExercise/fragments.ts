export const groupExerciseFields = `
	__typename
	id
	eventIndex
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
		eventIndex
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
