import React from 'react'

import { useUserResult } from 'api/user'
import NotificationBar from './NotificationBar'

export default function RecommendLogIn({ recommend }) {
	const { loading, data } = useUserResult()

	// Check if the user is known to be not logged in. If so, show the notification.
	const display = recommend && !loading && (!data || !data.me)
	return <NotificationBar display={!!display} type="info">Je bent niet ingelogd. Voortgang wordt niet bijgehouden. Gepersonaliseerde opgaven en feedback zijn niet mogelijk.</NotificationBar>
}
