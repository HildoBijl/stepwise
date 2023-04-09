import React from 'react'

import PageContainer from '../PageContainer'

import { useTabIndex } from './TabProvider'

export default function TabPages({ route }) {
	if (!route.tabs)
		throw new Error(`Invalid tabs call: tried to show tabs for a page that did not have any tabs.`)
	if (route.tabs.length === 1)
		return getTabContents(route.tabs[0])
	return route.tabs.map((tab, index) => <TabPage key={index} index={index} tab={tab} />)
}

function TabPage({ tab, index }) {
	// Determine whether we should display this tab page.
	const tabIndex = useTabIndex()
	const display = tabIndex === index

	// Set up the tab page.
	return <div style={{ display: display ? 'block' : 'none' }}>{getTabContents(tab)}</div>
}

function getTabContents(tab) {
	return tab.preventPageContainer ? tab.page : <PageContainer>{tab.page}</PageContainer>
}