import React, { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { sortByIndices } from 'step-wise/util/arrays'

import { useUserId } from 'api/user'
import { usePaths } from 'ui/routing'
import { Head, Par } from 'ui/components/containers'
import { useMyGroupsQuery, useCreateGroupMutation, useJoinGroupMutation, useActivateGroupMutation, useMyGroupsSubscription } from 'api/group'

import JoinGroupConditions from './JoinGroupConditions'
import ActiveGroup from './ActiveGroup'
import OtherGroups from './OtherGroups'
import GroupCreation from './GroupCreation'

export default function Groups() {
	// Get myGroups and listen to updates.
	const { loading, error, data, subscribeToMore } = useMyGroupsQuery()
	useMyGroupsSubscription(subscribeToMore)

	// Split the groups up into the active group and the other groups.
	const userId = useUserId()
	const myGroups = data?.myGroups
	const activeGroup = useMemo(() => myGroups && myGroups.find(group => {
		const member = group.members.find(member => member.userId === userId)
		return member && member.active
	}), [myGroups, userId])
	const otherGroups = useMemo(() => {
		if (!myGroups)
			return []
		const groups = activeGroup ? myGroups.filter(group => group.code !== activeGroup.code) : myGroups
		const lastGroupActivity = groups.map(group => Math.max(...group.members.map(member => new Date(member.lastActivity).getTime())))
		return sortByIndices(groups, lastGroupActivity, false)
	}, [activeGroup, myGroups])

	// If a group code has been given for a group the user is a member of, join that group.
	const { code } = useParams()
	const paths = usePaths()
	const [activateGroup] = useActivateGroupMutation(code)
	const navigate = useNavigate()
	useEffect(() => {
		if (code && myGroups && myGroups.find(group => group.code === code)) {
			activateGroup(code)
			navigate(paths.groups(), { replace: true }) // Remove the code from the URL.
		}
	}, [code, paths, activateGroup, navigate, myGroups])

	// Deal with data loading issues.
	if (error)
		return <Par>Oops ... er ging iets mis met het laden van alle groepen.</Par>
	if (loading)
		return <Par>Groepen worden geladen...</Par>

	// If a code has been provided to join a group, and this group is not already joined, show a join confirmation screen.
	if (code && !myGroups.find(group => group.code === code))
		return console.log(myGroups) || console.log(myGroups.find(group => group.code === group)) || <JoinGroupConditions code={code} />

	// Render the component as usual.
	return <>
		{activeGroup ? <ActiveGroup group={activeGroup} /> : null}
		{otherGroups.length > 0 ? <OtherGroups groups={otherGroups} hasActiveGroup={!!activeGroup} /> : null}
		<GroupCreation />
	</>
}
