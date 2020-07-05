const resolvers = {
	Event: {
		performedAt: event => event.createdAt,
	},
}

module.exports = resolvers

