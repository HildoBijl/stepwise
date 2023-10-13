import React, { useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import { useShutdownAccountMutation } from 'api/user'
import { logOutAddress } from 'settings'

import { TranslationSection, Translation } from 'i18n'
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

export function DeleteAccount() {
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
		helperText = <Translation entry="invalidEmail">Failed to delete account. This email address is not coupled to your account.</Translation>
	}

	// Check if a success message should be displayed.
	if (data)
		helperText = <Translation entry="successfulDeletion">Your account has been deleted. You will be sent back to the home page.</Translation>

	return <TranslationSection entry="deleteAccount">
		<Head><Translation entry="title">Delete account</Translation></Head>
		<Par><Translation entry="explanation">If you delete your account, then <strong>all</strong> your data on Step-Wise will be erased. This cannot be undone. Of course you can create a new account afterwards, but this account will start from zero.</Translation></Par>
		<Par><Translation entry="confirmation">Are you sure you wish to delete your account? Then enter your email address below as confirmation.</Translation></Par>
		<form noValidate autoComplete="off" onSubmit={submitForm}>
			<TextField id="confirmEmail" className={classes.email} label={<Translation entry="fieldPlaceholder">Email address</Translation>} variant="outlined" size="small" value={confirmEmail} onChange={(evt) => setConfirmEmail(evt.target.value)} error={isError} helperText={helperText} />
			<Button variant="contained" color="secondary" onClick={submitForm}><Translation entry="buttonText">Delete account</Translation></Button>
		</form>
	</TranslationSection>
}
