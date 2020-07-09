const { createClient, defaultConfig } = require('../client')

// const SPECIAL_USER_ID = '00000000-0000-0000-0000-000000000000'

const seed = async db => {
	const user = await db.User.create({
		id: '00000000-0000-0000-0000-000000000000',
		name: 'Step Wise',
		email: 'step@wise.com'
	})
	await user.createSurfConextProfile({
		id: '00000000-0000-0000-0000-000000000000',
	})
}

describe('SkillAPI', () => {
	it('does a simple test', () => {
		expect(1).toBe(1)
	})

	it('does not give data when no user is logged in', async () => {
		const client = await createClient(seed)

		await client.graphql({ query: `{mySkills {id skillId name}}` })
			.rejects
			.toThrow()
	})
})
