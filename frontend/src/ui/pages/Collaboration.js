import React, { useState } from 'react'
import { Link, useParams, useNavigate, redirect } from 'react-router-dom'

import { useRoute, usePaths } from 'ui/routing'
import { Par } from 'ui/components/containers'
import { useMyGroupsQuery, useGroupQuery, useCreateGroupMutation, useJoinGroupMutation, useLeaveGroupMutation, useGroupSubscription } from 'api/group'

export default function Collaboration() {
	const { loading, error, data } = useMyGroupsQuery()
	const [createGroup] = useCreateGroupMutation()
	const [joinGroup] = useJoinGroupMutation()
	const [code, setCode] = useState('')
	const paths = usePaths()
	const navigate = useNavigate()

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
					<Link to={`/collaboration/${group.code}`}>{group.code}</Link>
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
	const { loading, error, data, subscribeToMore } = useGroupQuery(code)
	useGroupSubscription(code, subscribeToMore)
	const [leaveGroup] = useLeaveGroupMutation(code)
	if (error) {
		console.log(error)
		return 'Error!'
	}
	if (loading) {
		return 'Loading...'
	}
	return <>
		<Par>De leden van deze groep zijn:</Par>
		<ul>
			{data.group.members.map((member, i) => <li key={i}>{member.name || '(anonymous)'}</li>)}
		</ul>
		<Par>Ook is het mogelijk om de <Link onClick={() => leaveGroup()} to=".." relative="path">groep te verlaten</Link>.</Par>
	</>
}
