import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'

import { boundTo } from 'step-wise/util/numbers'

import { useConsistentValue, useLatest } from 'util/react'

import { getOrderedTabs } from './util'

const TabContext = createContext()
export default function TabProvider({ children }) {
	const [tab, setTab] = useState()
	const [tabs, setTabs] = useState([])
	const tabIndex = tabs.length === 0 || !tabs.includes(tab) ? 0 : tabs.indexOf(tab)

	// Define refs where needed.
	const tabsRef = useLatest(tabs)

	// Set up handlers.
	const setTabIndex = useCallback(tabIndex => {
		const tabs = tabsRef.current
		tabIndex = boundTo(tabIndex, 0, tabs.length - 1)
		setTab(tabs[tabIndex])
	}, [tabsRef, setTab])

	// Set up the context value.
	const value = {
		tabIndex: tabs.length === 0 ? undefined : tabIndex, // On no tabs, give undefined as tabIndex.
		setTabIndex,
		tab: tabs.length === 0 ? undefined : tab,
		setTab,
		tabs,
		setTabs,
	}

	// Pass on the context value.
	return <TabContext.Provider value={value}>{children}</TabContext.Provider>
}

export function useTabContext() {
	return useContext(TabContext)
}

// useTabs is called by a component that wants to display tabs on the page. It takes an array of tab names, like ["theory", "practice", "references"], and optionally an initial tab "practice". It returns the full tab context.
export function useTabs(tabs, initialTab) {
	const context = useTabContext()
	const { tab, setTabs, setTab, setTabIndex } = context
	tabs = useConsistentValue(getOrderedTabs(tabs))

	// On a change in tabs, update the tabs.
	const tabRef = useLatest(tab)
	useEffect(() => {
		setTabs(tabs)

		// Apply a potential initial tab. Also check: if the old tab is not valid, reset to first tab.
		const tab = tabRef.current
		if (initialTab && tabs.includes(initialTab))
			setTab(initialTab)
		else if (!tab || !tabs.includes(tabRef.current))
			setTabIndex(0)

		// On dismount, clear tabs.
		return () => setTabs([])
	}, [tabs, initialTab, tabRef, setTabs, setTab, setTabIndex])

	// Return the context for further application.
	return context
}
