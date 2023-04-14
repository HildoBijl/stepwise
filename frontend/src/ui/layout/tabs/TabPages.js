import React from 'react'

import { useTabs, useTabContext } from './TabProvider'

export default function TabPages({ pages, initialPage }) {
	useTabs(Object.keys(pages), initialPage)
	return Object.keys(pages).map(id => <TabPage key={id} tab={id}>{pages[id]}</TabPage>)
}

function TabPage({ tab, children }) {
	// Determine whether we should display this tab page.
	const { tab: currentTab } = useTabContext()
	const display = tab === currentTab

	// Set up the tab page.
	return <div style={{ display: display ? 'block' : 'none' }}>{children}</div>
}
