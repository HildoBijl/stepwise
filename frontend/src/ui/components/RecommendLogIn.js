import React from 'react'

import NotificationBar from './NotificationBar'
import { useUserResults } from '../api/user'

export default function RecommendLogIn({ recommend }) {
	const { loading, data } = useUserResults()

	// Check if the user is known to be not logged in. If so, show the notification.
	const display = recommend && !loading && !data.me
	return <NotificationBar display={display} type="info">You are not signed in. Progress is not tracked. Personalized exercises and feedback are not possible.</NotificationBar>
}
