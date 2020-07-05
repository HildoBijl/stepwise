const { gql } = require('apollo-server-express')

const schema = gql`
	type Event {
		id: ID!
		action: JSON!
		progress: JSON!
		performedAt: DateTime!
	}
`

module.exports = schema
