// This is the data that will be loaded on groups.
export const groupParameters = `
	code
	members {
		groupId
		userId
		name
		givenName
		familyName
		active
	}
`

export function addGroupToList(newGroup, groups = []) {
	if (groups.some(group => group.code === newGroup.code))
		return groups.map(group => group.code === newGroup.code ? newGroup : group)
	return [...groups, newGroup]
}

export function removeGroupFromList(code, groups = []) {
	const result = groups.filter(group => group.code !== code)
	return result.length === groups.length ? groups : result
}
