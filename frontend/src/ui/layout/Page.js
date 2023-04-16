import React from 'react'

import { useRoute } from 'ui/routing'
import { ModalManager, OfflineNotification, RecommendLogIn } from 'ui/components'
import FieldController from 'ui/form/FieldController'

import PageContainer from './PageContainer'
import Header from './Header'
import { TabProvider, TabPages } from './tabs'

export default function Page() {
	// Determine the contents.
	let result = <Contents />

	// Iterate over all parents to provide all Providers.
	let route = useRoute()
	while (route !== undefined) {
		if (route.Provider)
			result = <route.Provider>{result}</route.Provider>
		route = route.parent
	}

	// All done!
	return result
}

function Contents() {
	const route = useRoute()

	// Full page components don't get a header/container, while regular pages do.
	if (route.fullPage)
		return <PageWrapper><route.component /></PageWrapper>

	return (
		<PageWrapper>
			<Header Indicator={route.Indicator} />
			<OfflineNotification />
			<RecommendLogIn recommend={route.recommendLogIn} />
			{route.Notification ? <route.Notification /> : null}
			{route.tabs ? <TabPages route={route} /> : <SinglePage route={route} />}
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

function SinglePage({ route }) {
	if (route.preventPageContainer)
		return <route.component />
	return <PageContainer><route.component /></PageContainer>
}
