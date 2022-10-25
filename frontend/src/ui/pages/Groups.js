import React, { Fragment, useState, useEffect, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { useUserId } from 'api/user'
import { usePaths } from 'ui/routing'
import { Head, Par, List } from 'ui/components/containers'
import { useMyGroupsQuery, useGroupQuery, useCreateGroupMutation, useJoinGroupMutation, useLeaveGroupMutation, useActivateGroupMutation, useDeactivateGroupMutation, useGroupSubscription, useMyGroupsSubscription } from 'api/group'

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
	const otherGroups = useMemo(() => activeGroup ? myGroups.filter(group => group.code !== activeGroup.code) : myGroups, [activeGroup, myGroups])

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
		return <>Oops ... er ging iets mis met het laden van alle groepen.</>
	if (loading)
		return <>Groepen worden geladen...</>

	// If a code has been provided to join a group, and this group is not already joined, show a join confirmation screen.
	if (code && !myGroups.find(group => group.code === group))
		return <JoinGroupConditions code={code} />

	// Render the component as usual.
	return <>
		{activeGroup ? <ActiveGroup group={activeGroup} /> : null}
		{otherGroups.length > 0 ? <OtherGroups groups={otherGroups} hasActiveGroup={!!activeGroup} /> : null}
		<GroupControl />
	</>
}

function ActiveGroup({ group }) {
	const paths = usePaths()
	const userId = useUserId()
	const [deactivateGroup] = useDeactivateGroupMutation()

	// Split the members up into the user and others.
	const otherMembers = useMemo(() => group.members.filter(member => member.userId !== userId), [group, userId])

	return <>
		<Head>Je actieve groep: <Link to={paths.group({ code: group.code })}>{group.code}</Link></Head>
		{otherMembers.length === 0 ?
			<CodeShareConditions group={group} /> :
			<>
				<Par>
					De andere leden van deze groep zijn:
					<List items={otherMembers.map(member => <Fragment key={member.userId}>{member.name}{member.active ? ' (active)' : ''}</Fragment>)} />
				</Par>
			</>}
		<Par><Link to="." onClick={deactivateGroup}>Verlaat deze samenwerkingsgroep</Link></Par>
	</>
}

const groupPossibilities = [
	<>Zien wie er in de samenwerkingsgroep zit: zowel actieve leden als eerdere leden.</>,
	<>Bij opgaven: de inzendingen van groepsgenoten zien en mogelijk overnemen.</>,
	<>Tips krijgen over welke vaardigheid handig is om te oefenen, gezien het niveau van actieve groepsgenoten.</>
]

function CodeShareConditions({ group }) {
	const paths = usePaths()
	return <>
		<Par>	Je zit nu in de samenwerkingsgroep <Link to={paths.group({ code: group.code })}>{group.code}</Link>. Je bent nog de enige in deze groep. Deel de samenwerkingscode of de <Link to={paths.group({ code: group.code })}>link</Link> met je studiegenoten om met hen samen te werken.</Par>

		<Par>
			Elke persoon die de code invoert krijgt toegang tot de samenwerkingsgroep. Dit omvat:
			<List items={groupPossibilities} />
			Je kunt een samenwerking altijd verlaten en/of vergeten. Als je een samenwerking vergeet, dan worden al je sporen uit deze samenwerking gewist.
		</Par>
	</>
}

function JoinGroupConditions({ code }) {
	const paths = usePaths()
	const [joinGroup] = useJoinGroupMutation()

	return <><Par>Je staat op het punt om lid te worden van de samenwerkingsgroep {code.toUpperCase()}. Je kan dan:
		<List items={groupPossibilities} />
		Alle huidige en toekomstige leden van deze samenwerking kunnen dit uiteraard ook. Je kunt een samenwerking altijd weer verlaten en/of vergeten. Bij het vergeten worden al je sporen uit de samenwerkingsgroep gewist.</Par>
		<Par><Link to={paths.groups()} onClick={() => joinGroup(code)}>Ja, meedoen</Link></Par>
		<Par><Link to={paths.groups()}>Nee, laat maar</Link></Par>
	</>
}

function OtherGroups({ groups, hasActiveGroup }) {
	const paths = usePaths()
	const userId = useUserId()

	return <>
		<Head>{hasActiveGroup ? 'Overige groepen' : 'Jouw groepen'}</Head>
		<List items={groups.map(group => <OtherGroup key={group.code} group={group} />)} />
	</>
}

function OtherGroup({ group }) {
	const paths = usePaths()
	const userId = useUserId()
	const [leaveGroup] = useLeaveGroupMutation(group.code)

	// Split the members up into the user and others.
	const otherMembers = useMemo(() => group.members.filter(member => member.userId !== userId), [group, userId])

	return <>
		<Link to={paths.group({ code: group.code })}>{group.code}</Link> - {otherMembers.length > 0 ? otherMembers.map((member, index) => <span key={index}>{index === 0 ? '' : ' - '}{member.name}{member.active ? ' (active)' : ''}</span>) : 'Niemand'} - <Link to="." onClick={() => leaveGroup()}>Vergeet</Link>
	</>
}

function GroupControl() {
	const paths = usePaths()

	// Get mutation functions.
	const [createGroup] = useCreateGroupMutation()
	const [joinGroup] = useJoinGroupMutation()

	// Set up a state tracking the input field.
	const [code, setCode] = useState('')

	return <>
		<Head>Control panel</Head>
		<Par>You can <Link onClick={() => createGroup()}>Create a group</Link>.</Par>
		<Par>Or fill in a code below and then <Link onClick={() => joinGroup(code)} to={paths.group({ code })}>Join the group</Link>.</Par>
		<input type="text" value={code} onChange={evt => setCode(evt.target.value)} />
	</>
}

// ToDo: potentially remove the code below?

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
