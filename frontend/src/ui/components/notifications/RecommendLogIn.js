import React from 'react'

import { useUserResult } from 'api/user'
import { Translation } from 'i18n'

import NotificationBar from './NotificationBar'

export default function RecommendLogIn({ recommend }) {
	const { loading, data } = useUserResult()

	// Check if the user is known to be not logged in. If so, show the notification.
	const display = recommend && !loading && (!data || !data.me)
	return <NotificationBar display={!!display} type="info"><Translation entry="notifications.notLoggedIn" path="main">You are not logged in. Progress will not be tracked. Practice recommendations and personalized exercises are not possible.</Translation></NotificationBar>
}
