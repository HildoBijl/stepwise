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
		report
		actions {
			id
			userId
			performedAt
			action
		}
	}
`

export const groupActionUpdateFields = `
	exerciseId
	eventIndex
	userId
	action {
		id
		userId
		action
		performedAt
	}
`

export const groupEventResolutionFields = `
	exerciseId
	eventIndex
	state
	report
	active
	nextEvent {
		id
		eventIndex
		state
		report
		performedAt
	}
`
