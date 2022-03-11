import React from 'react'

import { Par } from 'ui/components/containers'
import { Link, useParams } from "react-router-dom";
import {useMyGroupsQuery, useGroupSubscription, useGroupQuery} from "../../api/group"

export default function Collaboration() {
	const { loading, error, data } = useMyGroupsQuery()
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
		</>
	)
}

export function Group() {
	const { groupCode } = useParams()
	const { loading, error, data, subscribeToMore } = useGroupQuery(groupCode)
	useGroupSubscription(groupCode, subscribeToMore)
	if (error) {
		console.log(error)
		return 'Error!'
	}
	if (loading) {
		return 'Loading...'
	}
	return <ul>
		{data.group.members.map((member, i) => <li key={i}>{member.name || '(anonymous)'}</li>)}
	</ul>
}
