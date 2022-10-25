import React from 'react'
import { Link } from 'react-router-dom'

import { usePaths } from 'ui/routing'
import { Head, List } from 'ui/components/containers'
import { useLeaveGroupMutation } from 'api/group'

import { useOtherMembers } from './util'
import MemberList from './MemberList'

export default function OtherGroups({ groups, hasActiveGroup }) {
	return <>
		<Head>{hasActiveGroup ? 'Overige groepen' : 'Jouw groepen'}</Head>
		<List items={groups.map(group => <OtherGroup key={group.code} group={group} />)} />
	</>
}

function OtherGroup({ group }) {
	const paths = usePaths()
	const [leaveGroup] = useLeaveGroupMutation(group.code)
	const otherMembers = useOtherMembers(group.members)

	return <>
		<Link to={paths.group({ code: group.code })}>{group.code}</Link>
		<MemberList members={otherMembers} />
		<Link to="." onClick={() => leaveGroup()}>Vergeet</Link>
	</>
}