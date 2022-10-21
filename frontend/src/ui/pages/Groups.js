import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { useUserId } from 'api/user'
import { useActiveGroup } from 'api/group'
import { usePaths } from 'ui/routing'
import { Par } from 'ui/components/containers'
import { useMyGroupsQuery, useGroupQuery, useCreateGroupMutation, useJoinGroupMutation, useLeaveGroupMutation, useActivateGroupMutation, useDeactivateGroupMutation, useGroupSubscription, useMyGroupsSubscription } from 'api/group'

export default function Groups() {
	const paths = usePaths()
	const userId = useUserId()

	// Get myGroups and listen to updates.
	const { loading, error, data, subscribeToMore } = useMyGroupsQuery()
	useMyGroupsSubscription(subscribeToMore)

	// Get mutation functions.
	const [createGroup] = useCreateGroupMutation()
	const [joinGroup] = useJoinGroupMutation()

	// Set up a state tracking the input field.
	const [code, setCode] = useState('')

	// Test stuff.
	const myActiveGroup = useActiveGroup()
	console.log(myActiveGroup)

	// Deal with data loading issues.
	if (error)
		return <>Oops ... er ging iets mis met het laden van alle groepen.</>
	if (loading)
		return <>Groepen worden geladen...</>

	// Render the component.
	return <>
		<Par>Your groups:</Par>
		<ul>
			{data.myGroups.map(group => {
				const member = group.members.find(member => member.userId === userId)
				if (!member)
					return null
				return <li key={group.code}>
					<Link to={paths.group({ code: group.code })}>{group.code}</Link>{member.active ? ' (active)' : ''} - {group.members.map((member, index) => <span key={index}>{index === 0 ? '' : ' - '}{member.name}</span>)}
				</li>
			})}
		</ul>
		<Par>You can <Link onClick={() => createGroup()}>Create a group</Link>.</Par>
		<Par>Or fill in a code below and then <Link onClick={() => joinGroup(code)} to={paths.group({ code })}>Join the group</Link>.</Par>
		<input type="text" value={code} onChange={evt => setCode(evt.target.value)} />
	</>
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

	// Redirect the user back to the groups page when needed.
	useEffect(() => {
		if (error || (data && !data.group))
			navigate(paths.groups())
	}, [error, data, paths, navigate])

	// Deal with data loading issues.
	if (error || (data && !data.group))
		return <>Oops ... er ging iets mis met het laden van deze groep.</>
	if (loading)
		return <>Groepen worden geladen...</>

	// Extract data.
	const { group } = data
	const { members } = group
	const member = members.find(member => member.userId === userId)
	const active = member.active

	// Render the component.
	return <>
		<Par>De leden van deze groep {code.toUpperCase()} zijn:</Par>
		<ul>
			{members.map((member, index) => <li key={index}>{member.name || '(anonymous)'}{member.active ? ' (active)' : ''}</li>)}
		</ul>
		<Par>Ook is het mogelijk om de <Link onClick={() => (active ? deactivateGroup : activateGroup)()} relative="path">groep te {active ? 'de' : ''}activeren</Link> of de <Link onClick={() => leaveGroup()} relative="path">groep te verlaten</Link>.</Par>
	</>
}
