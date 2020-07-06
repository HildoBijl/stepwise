import React, { useEffect, useState, useCallback } from 'react'

import NotificationBar from './NotificationBar'

export default function OfflineNotification() {
	// Use a boolean state parameter to track if the user is online/offline.
	const [online, setOnline] = useState(navigator.onLine)
	const updateStatus = useCallback(() => setOnline(navigator.onLine), [])
	useEffect(() => {
		window.addEventListener('online', updateStatus)
		window.addEventListener('offline', updateStatus)
		return () => {
			window.removeEventListener('online', updateStatus)
			window.removeEventListener('offline', updateStatus)
		}
	}, [updateStatus])

	// Only display the notification when the user is offline. 
	return <NotificationBar display={!online} type="warning" text="You seem to have lost your internet connection. Some functionalities will fail to work until you're back online." />
}
