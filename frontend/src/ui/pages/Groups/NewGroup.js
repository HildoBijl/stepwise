import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import { Done, Clear } from '@material-ui/icons'

import { usePaths } from 'ui/routing'
import { Par, List } from 'ui/components/containers'
import { useCreateGroupMutation, useActiveGroup } from 'api/group'

import { groupPossibilities } from './util'

export default function NewGroup() {
	const paths = usePaths()
	const navigate = useNavigate()
	const [createGroup] = useCreateGroupMutation()

	// If there is an active group, go to the main group page.
	const activeGroup = useActiveGroup()
	useEffect(() => {
		if (activeGroup)
			navigate(paths.groups())
	}, [activeGroup, navigate, paths])

	return <>
		<Par>Je staat op het punt om een nieuwe samenwerkingsgroep aan te maken. Je krijgt dan een code/link om met je studiegenoten te delen. Elke persoon die de code invoert krijgt toegang tot de samenwerkingsgroep. Dit omvat:
			<List items={groupPossibilities} />
			Je kunt een samenwerkingsgroep altijd verlaten en/of vergeten. Als je een samenwerkingsgroep vergeet, dan worden al je sporen uit deze samenwerkingsgroep permanent gewist.
		</Par>
		<Par>
			<Button
				variant="contained"
				color="primary"
				startIcon={<Done />}
				onClick={() => {
					createGroup()
					navigate(paths.groups())
				}}
				style={{ margin: '0.5rem' }}
			>Ja, ik ga akkoord</Button>
			<Button
				variant="contained"
				color="secondary"
				startIcon={<Clear />}
				onClick={() => navigate(paths.groups())}
				style={{ margin: '0.5rem' }}
			>Nee, dat wil ik niet</Button>
		</Par>
	</>
}