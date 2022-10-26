import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import { Done, Clear } from '@material-ui/icons'

import { usePaths } from 'ui/routing'
import { Par, List } from 'ui/components/containers'
import { useJoinGroupMutation } from 'api/group'

import { groupPossibilities } from './util'

export default function JoinGroupConditions({ code }) {
	const paths = usePaths()
	const navigate = useNavigate()
	const [joinGroup] = useJoinGroupMutation()

	return <>
		<Par>
			Je staat op het punt om lid te worden van de samenwerkingsgroep {code.toUpperCase()}. Je kan dan:
			<List items={groupPossibilities} />
			Alle huidige en toekomstige leden van deze samenwerkingsgroep kunnen dit uiteraard ook. Je kunt een samenwerkingsgroep altijd weer verlaten en/of vergeten. Bij het vergeten worden al je sporen uit de samenwerkingsgroep gewist.
		</Par>
		<Par>
			<Button
				variant="contained"
				color="primary"
				startIcon={<Done />}
				onClick={() => joinGroup(code)}
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