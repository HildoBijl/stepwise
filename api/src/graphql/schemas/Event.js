import { gql } from 'apollo-server-express'

export default gql`
	type Event {
		id: ID!
		action: JSON!
		progress: JSON!
		performedAt: DateTime!
	}
`
