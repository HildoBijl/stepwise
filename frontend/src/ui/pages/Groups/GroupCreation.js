import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import { usePaths } from 'ui/routing'
import { Head, Par } from 'ui/components/containers'
import { useCreateGroupMutation, useJoinGroupMutation } from 'api/group'

export default function GroupCreation() {
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
