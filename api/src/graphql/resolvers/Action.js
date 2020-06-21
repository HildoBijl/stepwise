const resolvers = {
	Action: {
		data: action => action.action,
		performedAt: action => action.createdAt,
	},
}

module.exports = resolvers

