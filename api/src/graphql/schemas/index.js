import { gql } from 'apollo-server-express'
import userSchema from './User'
import skillSchema from './Skill'
import exerciseSchema from './Exercise'
import eventSchema from './Event'

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

export default [
	linkSchema,
	userSchema,
	skillSchema,
	exerciseSchema,
	eventSchema,
]
