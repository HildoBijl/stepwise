import React, { useState } from 'react'
import { Button, TextField } from '@mui/material'

import { Translation, TranslationGroup } from '@step-wise/i18n'

import { signOutAddress } from 'settings'
import { useDeleteAccount } from 'api'
import { Par, Head } from 'ui/components'

export function DeleteAccount() {
	const [confirmEmail, setConfirmEmail] = useState('')
	const [lastSubmission, setLastSubmission] = useState()
	const [deleteAccount, { succeeded, error }] = useDeleteAccount()

	// On submission, try to delete the account.
	const submitForm = (evt) => {
		evt.preventDefault()
		setLastSubmission(confirmEmail)
		deleteAccount(confirmEmail)
			.then(() => {
				setTimeout(() => {
					window.location.href = signOutAddress
				}, 3000)
			})
			.catch(() => { }) // Do nothing here upon an error.
	}

	// Check if an error message should be displayed.
	let isError
	let helperText = ''
	if (error && confirmEmail === lastSubmission) {
		isError = true
		helperText = <Translation id="invalidEmail">Failed to delete account. This email address is not coupled to your account.</Translation>
	}

	// Check if a success message should be displayed.
	if (succeeded)
		helperText = <Translation id="success">Your account has been deleted. You will be sent back to the home page.</Translation>

	return <TranslationGroup path="deleteAccount">
		<Head><Translation id="title">Delete account</Translation></Head>
		<Par><Translation id="explanation">If you delete your account, then <strong>all</strong> your data on Step-Wise will be erased. This cannot be undone. Of course you can create a new account afterwards, but this account will start from zero.</Translation></Par>
		<Par><Translation id="confirmation">Are you sure you wish to delete your account? Then enter your email address below as confirmation.</Translation></Par>
		<form noValidate autoComplete="off" onSubmit={submitForm}>
			<TextField id="confirmEmail" label={<Translation id="email">Email address</Translation>} variant="outlined" size="small" value={confirmEmail} onChange={(evt) => setConfirmEmail(evt.target.value)} error={isError} helperText={helperText} sx={{
				mb: 1, mr: 1,
				width: 'min(50ch, 100%)',
				'& input': {
					background: '#fff',
				}
			}} />
			<Button variant="contained" color="secondary" onClick={submitForm}><Translation id="button">Delete account</Translation></Button>
		</form>
	</TranslationGroup>
}
