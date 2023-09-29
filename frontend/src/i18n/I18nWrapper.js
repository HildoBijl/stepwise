import React, { Suspense } from 'react'

export function I18nWrapper({ children }) {
	return <Suspense fallback={null}>
		{children}
	</Suspense>
}
