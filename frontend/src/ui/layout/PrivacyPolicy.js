import React from 'react'
import { Box, Button } from '@mui/material'
import { Check, Clear } from '@mui/icons-material'

import { Translation, TranslationGroup } from '@step-wise/i18n'

import { signOutAddress } from 'settings'
import { useUser, useAcceptLatestPrivacyPolicy } from 'api'
import { List } from 'ui/components'
import { linkStyle } from 'ui/theme'

import { PageTranslationFile } from '../pages'

export function PrivacyPolicyWrapper({ children }) {
	const user = useUser()

	// Not signed in? Just show contents.
	if (!user)
		return children

	// Never approved?
	if (!user.privacyPolicyConsent || !user.privacyPolicyConsent.acceptedAt)
		return <ApprovePrivacyPolicy firstTime={true} />

	// Approved an older version?
	if (!user.privacyPolicyConsent.isLatestVersion)
		return <ApprovePrivacyPolicy firstTime={false} />

	// All in order. Show contents.
	return children
}

export function ApprovePrivacyPolicy({ firstTime }) {
	const signOut = () => { window.location.href = signOutAddress }
	const [acceptLatestPrivacyPolicy] = useAcceptLatestPrivacyPolicy()

	return <PageTranslationFile page="privacyPolicy">
		<Box sx={{
			display: 'flex',
			flexFlow: 'row nowrap',
			margin: 0,
			minHeight: '100vh',
			padding: '0 0.8rem',
			placeItems: 'center',
			width: '100vw',
			'& a': linkStyle,
		}}>
			<Box sx={{
				display: 'flex',
				flexFlow: 'column nowrap',
				margin: 0,
				placeItems: 'center',
				width: '100vw',
			}}>
				<Box sx={theme => ({
					display: 'flex',
					flexFlow: 'column nowrap',
					margin: 0,
					maxWidth: `${theme.breakpoints.values.sm}px`,
					placeItems: 'center',
					textAlign: 'center',
				})}>
					{firstTime ? <FirstTimeContent /> : <UpdateContent />}
					<Box sx={theme => ({
						display: 'flex',
						flexFlow: 'row wrap',
						justifyContent: 'center',
						margin: '1rem 0',
						'& button': {
							flexGrow: 0,
							flexShrink: 0,
							margin: '0.4rem',
							[theme.breakpoints.down('xs')]: {
								width: '100%',
							},
						},
					})}>
						<TranslationGroup path="buttons">
							<Button variant="contained" startIcon={<Clear />} onClick={() => signOut()} color="secondary"><Translation id="reject">Do not approve: sign out</Translation></Button>
							<Button variant="contained" startIcon={<Check />} onClick={() => acceptLatestPrivacyPolicy()} color="primary"><Translation id="approve">Approve: finish signing in</Translation></Button>
						</TranslationGroup>
					</Box>
				</Box>
			</Box>
		</Box>
	</PageTranslationFile >
}

function FirstTimeContent() {
	return <TranslationGroup path="firstTime">
		<h1><Translation id="title">Privacy Policy</Translation></h1>
		<p style={{ fontSize: '1.3em' }}><Translation id="intro">To use Step-Wise, you must approve of the <a href="/PrivacyPolicy.pdf" target="_blank" rel="noreferrer">Privacy Policy</a>. In short:</Translation></p>
		<Translation id="list">
			<List sx={{ marginTop: '0.2rem', marginBottom: '0.2rem', textAlign: 'left', '& li': { margin: '0.2rem' } }}>
				<List.Item>We use cookies only for sign-in and site settings purposes. No tracking/ads.</List.Item>
				<List.Item>We won't share personal identifiable data with others unless after specific approval.</List.Item>
				<List.Item>You can always remove all your data by deleting your account.</List.Item>
			</List>
		</Translation>
	</TranslationGroup>
}

function UpdateContent() {
	return <TranslationGroup path="update">
		<h1><Translation id="title">Privacy Policy Update</Translation></h1>
		<p className="intro"><Translation id="intro">Our <a href="/PrivacyPolicy.pdf" target="_blank" rel="noreferrer">Privacy Policy</a> has been updated. To continue using Step-Wise, you must approve of this version.</Translation></p>
	</TranslationGroup>
}
