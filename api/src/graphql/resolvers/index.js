const { EmailAddressResolver, DateTimeResolver, JSONResolver } = require('graphql-scalars')

const resolverKeys = [
	'User',
	'Skill',
	'Exercise',
	'Group',
	'GroupExercise',
]

const scalarResolvers = {
	EmailAddress: EmailAddressResolver,
	DateTime: DateTimeResolver,
	JSON: JSONResolver,
}

// Put all resolvers into one big array and export it.
const resolvers = [scalarResolvers]
resolverKeys.forEach(key => {
	resolvers.push(require(`./${key}`))
})
module.exports = resolvers
