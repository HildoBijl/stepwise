export const skillFields = `
	id
	skillId
	numPracticed
	coefficients
	coefficientsOn
	highest
	highestOn
	createdAt
	updatedAt
`

export const exerciseFields = `
	id
	exerciseId
	state
	startedOn
	active
	progress
	history {
		id
		action
		progress
		performedAt
	}
`
