import React from 'react'

import { useUser, useIsUserLoading } from 'api'
import { Translation } from 'i18n'

import NotificationBar from './NotificationBar'

export default function RecommendSignIn({ recommend }) {
	const user = useUser()
	const isUserLoading = useIsUserLoading()

	// Check if the user is known to be not signed in. If so, show the notification.
	const display = recommend && !isUserLoading && !user
	return <NotificationBar display={!!display} type="info"><Translation entry="notifications.notSignedIn" path="main">You are not signed in. Progress will not be tracked. Practice recommendations and personalized exercises are not possible.</Translation></NotificationBar>
}
