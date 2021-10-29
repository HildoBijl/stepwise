import { EmailAddressResolver, DateTimeResolver, JSONObjectResolver } from 'graphql-scalars'
import userResolver from './User'
import skillResolver from './Skill'
import exerciseResolver from './Exercise'
import eventResolver from './Event'

const scalarResolvers = {
	EmailAddress: EmailAddressResolver,
	DateTime: DateTimeResolver,
	JSON: JSONObjectResolver,
}

export default [
	scalarResolvers,
	userResolver,
	skillResolver,
	exerciseResolver,
	eventResolver,
]
