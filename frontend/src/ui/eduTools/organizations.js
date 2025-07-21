export const organizations = {
	stepwise: {
		name: 'Step-Wise',
		noTeachers: true,
	},
	hogeschoolUtrecht: {
		name: 'Hogeschool Utrecht',
	},
}

export function getOrganization(organizationId) {
	const organization = organizations[organizationId]
	if (!organization)
		throw new Error(`Invalid organization ID: cannot find the organization with ID "${organizationId}". Make sure that it exists.`)
	return organization
}
