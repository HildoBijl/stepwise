const { EmailAddressResolver, DateTimeResolver, JSONObjectResolver } = require('graphql-scalars')

const resolverKeys = [
	'User',
	'Skill',
	'Exercise',
	'Event',
	'Group',
]

const scalarResolvers = {
	EmailAddress: EmailAddressResolver,
	DateTime: DateTimeResolver,
	JSON: JSONObjectResolver,
}

// Put all resolvers into one big array and export it.
const resolvers = [scalarResolvers]
resolverKeys.forEach(key => {
	resolvers.push(require(`./${key}`))
})
module.exports = resolvers
