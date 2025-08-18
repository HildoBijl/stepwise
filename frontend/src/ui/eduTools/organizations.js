import stepwiseLogo from 'ui/images/logo.svg'
import hogeschoolUtrechtLogo from 'ui/images/HU.png'
import sintAgnesinstituutLogo from 'ui/images/SintAgnesinstituut.svg'

// Define all organizations that may have courses on Step-Wise.
export const organizations = {
	stepwise: {
		name: 'Step-Wise',
		logo: stepwiseLogo,
		country: 'wd', // World
		noTeachers: true,
	},
	hogeschoolUtrecht: {
		name: 'Hogeschool Utrecht',
		logo: hogeschoolUtrechtLogo,
		country: 'nl',
	},
	sintAgnesinstituut: {
		name: 'Sint-Agnesinstituut',
		logo: sintAgnesinstituutLogo,
		country: 'be',
	},
}
Object.keys(organizations).forEach(organizationId => {
	organizations[organizationId].id = organizationId
})

// getOrganization is a support function that returns an organization based on its ID. It checks the ID and throws an error when the ID is faulty.
export function getOrganization(organizationId) {
	const organization = organizations[organizationId]
	if (!organization)
		throw new Error(`Invalid organization ID: cannot find the organization with ID "${organizationId}". Make sure that it exists.`)
	return organization
}
