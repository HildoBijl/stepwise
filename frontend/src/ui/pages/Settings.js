import React, { useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import { useUser, useShutdownAccountMutation } from 'api/user'
import { logOutAddress } from 'ui/settings'

import { Par, Head } from 'ui/components'

const useStyles = makeStyles((theme) => ({
	email: {
		marginBottom: theme.spacing(1),
		marginRight: theme.spacing(1),
		width: 'min(50ch, 100%)',

		'& input': {
			background: '#fff',
		},
	},
}))

export default function About() {
	const user = useUser()
	return <>
		<Par>Je bent ingelogd als {user.name} &lt;{user.email}&gt;.</Par>
		<DeleteAccount />
	</>
}

function DeleteAccount() {
	const classes = useStyles()
	const [confirmEmail, setConfirmEmail] = useState('')
	const [lastSubmission, setLastSubmission] = useState()
	const [shutdownAccount, { data, error }] = useShutdownAccountMutation()

	// On submission, try to delete the account.
	const submitForm = (evt) => {
		evt.preventDefault()
		setLastSubmission(confirmEmail)
		shutdownAccount(confirmEmail)
			.then(() => {
				setTimeout(() => {
					window.location.href = logOutAddress
				}, 3000)
			})
			.catch(() => { }) // Do nothing here upon an error.
	}

	// Check if an error message should be displayed.
	let isError
	let helperText = ''
	if (error && confirmEmail === lastSubmission) {
		isError = true
		helperText = 'Niet gelukt. Dit emailadres is niet gekoppeld aan je account.'
	}

	// Check if a success message should be displayed.
	if (data)
		helperText = 'Gelukt. Het account is verwijderd. Je wordt doorgestuurd.'

	return <>
		<Head>Account verwijderen</Head>
		<Par>Als je je account verwijdert, dan worden <strong>alle</strong> gegevens van je op Step-Wise gewist. Dit kan niet ongedaan gemaakt worden! Je kunt daarna uiteraard wel een volledig nieuwe account aanmaken, maar deze begint weer vanaf nul.</Par>
		<Par>Weet je zeker dat je je account wilt verwijderen? Vul dan hieronder ter bevestiging je emailadres in.</Par>
		<form noValidate autoComplete="off" onSubmit={submitForm}>
			<TextField id="confirmEmail" className={classes.email} label="Emailadres" variant="outlined" size="small" value={confirmEmail} onChange={(evt) => setConfirmEmail(evt.target.value)} error={isError} helperText={helperText} />
			<Button variant="contained" color="secondary" onClick={submitForm}>Verwijder account</Button>
		</form>
	</>
}