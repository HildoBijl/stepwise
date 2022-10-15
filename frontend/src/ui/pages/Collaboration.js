import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { useUserId } from 'api/user'
import { usePaths } from 'ui/routing'
import { Par } from 'ui/components/containers'
import { useMyGroupsQuery, useGroupQuery, useCreateGroupMutation, useJoinGroupMutation, useLeaveGroupMutation, useActivateGroupMutation, useDeactivateGroupMutation, useGroupSubscription } from 'api/group'

export default function Groups() {
	const { loading, error, data } = useMyGroupsQuery()
	const [createGroup] = useCreateGroupMutation()
	const [joinGroup] = useJoinGroupMutation()
	const [code, setCode] = useState('')
	const paths = usePaths()

	if (error) {
		console.log(error)
		return 'Error!'
	}
	if (loading) {
		return 'Loading...'
	}
	return (
		<>
			<Par>Your groups:</Par>
			<ul>
				{data.myGroups.map(group => <li key={group.code}>
					<Link to={paths.group({ code: group.code })}>{group.code}</Link>{group.active ? ' (active)' : ''} - {group.members.map((member, index) => <span key={index}>{index === 0 ? '' : ' - '}{member.name}</span>)}
				</li>)}
			</ul>
			<Par>You can <Link onClick={() => createGroup()}>Create a group</Link>.</Par>
			<Par>Or fill in a code below and then <Link onClick={() => joinGroup(code)} to={paths.group({ code })}>Join the group</Link>.</Par>
			<input type="text" value={code} onChange={evt => setCode(evt.target.value)} />
		</>
	)
}

export function Group() {
	const { code } = useParams()
	const userId = useUserId()
	const navigate = useNavigate()
	const paths = usePaths()

	// Set up queries.
	const { loading, error, data, subscribeToMore } = useGroupQuery(code)
	useGroupSubscription(code, subscribeToMore)

	// Set up mutations.
	const [leaveGroup] = useLeaveGroupMutation(code)
	const [activateGroup] = useActivateGroupMutation(code)
	const [deactivateGroup] = useDeactivateGroupMutation(code)

	useEffect(() => {
		if (error || data?.group?.members?.length === 0)
			navigate(paths.groups())
	}, [error, data, paths, navigate])

	// Deal with data loading issues.
	if (error)
		return <>Oops ... er ging iets mis met het laden van deze groep.</>
	if (loading)
		return <>Groepen worden geladen...</>

	// Extract data.
	const { group } = data
	const { members, active } = group
	console.log(group)

	// Render the component.
	return <>
		<Par>De leden van deze groep {code.toUpperCase()} zijn:</Par>
		<ul>
			{members.map((member, index) => <li key={index}>{member.name || '(anonymous)'}{member.active ? ' (active)' : ''}</li>)}
		</ul>
		<Par>Ook is het mogelijk om de <Link onClick={() => (active ? deactivateGroup : activateGroup)()} relative="path">groep te {active ? 'de' : ''}activeren</Link> of de <Link onClick={() => leaveGroup()} relative="path">groep te verlaten</Link>.</Par>
	</>
}
