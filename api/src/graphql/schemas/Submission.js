const { gql } = require('apollo-server-express')

const schema = gql`
	type Submission {
		input: JSON!
		# correct: JSON!
	}
`

module.exports = schema
