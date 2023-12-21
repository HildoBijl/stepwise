import React from 'react'

import { useRoute } from 'ui/routingTools'
import { ModalManager, OfflineNotification, RecommendLogIn } from 'ui/components'
import { FieldController } from 'ui/form'

import PageContainer from './PageContainer'
import Header from './Header'
import { TabProvider } from './tabs'

export function Page() {
	// Determine the contents.
	let result = <Contents />

	// Iterate over all parents to provide all Providers.
	let route = useRoute()
	while (route !== undefined) {
		if (route.provider)
			result = <route.provider>{result}</route.provider>
		route = route.parent
	}

	// All done!
	return result
}

function Contents() {
	const route = useRoute()

	// Full page components don't get a header/container, while regular pages do.
	if (route.fullPage)
		return <PageWrapper><route.page /></PageWrapper>

	return (
		<PageWrapper>
			<Header Indicator={route.Indicator} />
			<OfflineNotification />
			<RecommendLogIn recommend={route.recommendLogIn} />
			{route.Notification ? <route.Notification /> : null}
			{route.preventPageContainer ? <route.page /> : <PageContainer><route.page /></PageContainer>}
		</PageWrapper>
	)
}

function PageWrapper({ children }) {
	return (
		<TabProvider>
			<FieldController>
				<ModalManager>
					{children}
				</ModalManager>
			</FieldController>
		</TabProvider>
	)
}
