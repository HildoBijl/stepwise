const { gql } = require('apollo-server-express')

const schema = gql`
	type Action {
		data: JSON!
		progress: JSON!
		performedAt: DateTime!
	}
`

module.exports = schema
