import React, { useState } from 'react'
import { Button, TextField } from '@mui/material'
import { Trans } from '@lingui/react/macro'

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
		helperText = <Trans id="settings.deleteAccount.invalidEmail">Failed to delete account. This email address is not coupled to your account.</Trans>
	}

	// Check if a success message should be displayed.
	if (succeeded)
		helperText = <Trans id="settings.deleteAccount.success">Your account has been deleted. You will be sent back to the home page.</Trans>

	return <>
		<Head><Trans id="settings.deleteAccount.title">Delete account</Trans></Head>
		<Par><Trans id="settings.deleteAccount.explanation">If you delete your account, then <strong>all</strong> your data on Step-Wise will be erased. This cannot be undone. Of course you can create a new account afterwards, but this account will start from zero.</Trans></Par>
		<Par><Trans id="settings.deleteAccount.confirmation">Are you sure you wish to delete your account? Then enter your email address below as confirmation.</Trans></Par>
		<form noValidate autoComplete="off" onSubmit={submitForm}>
			<TextField id="confirmEmail" label={<Trans id="settings.deleteAccount.email">Email address</Trans>} variant="outlined" size="small" value={confirmEmail} onChange={(evt) => setConfirmEmail(evt.target.value)} error={isError} helperText={helperText} sx={{
				mb: 1, mr: 1,
				width: 'min(50ch, 100%)',
				'& input': {
					background: '#fff',
				}
			}} />
			<Button variant="contained" color="secondary" onClick={submitForm}><Trans id="settings.deleteAccount.button">Delete account</Trans></Button>
		</form>
	</>
}
