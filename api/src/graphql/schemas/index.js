const { gql } = require('apollo-server-express')

const schemaKeys = [
	'User',
	'Skill',
	'Exercise',
	'Course',
	'Group',
	'GroupExercise',
]

const linkSchema = gql`
	scalar EmailAddress
	scalar DateTime
	scalar JSON

	type Query {
		_: Boolean
	}

	type Mutation {
		_: Boolean
	}

	type Subscription {
		_: Boolean
	}
`

// Put all schemas into one big array and export it.
const schemas = [linkSchema]
schemaKeys.forEach(key => {
	schemas.push(require(`./${key}`))
})
module.exports = schemas
