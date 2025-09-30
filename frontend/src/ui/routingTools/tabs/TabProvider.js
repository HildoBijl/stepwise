import React, { useState, useCallback, createContext, useContext } from 'react'

import { boundTo } from 'step-wise/util'

import { useConsistentValue, useLatest, useUpdater } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

import { getOrderedTabs } from './util'

const TabContext = createContext()
export function TabProvider({ children }) {
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
	const reset = useCallback(() => {
		setTab(undefined)
		setTabs([])
	}, [setTab, setTabs])

	// Set up the context value.
	const value = {
		tabIndex: tabs.length === 0 ? undefined : tabIndex, // On no tabs, give undefined as tabIndex.
		setTabIndex,
		tab: tabs.length === 0 ? undefined : tab,
		setTab,
		tabs,
		setTabs,
		reset,
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
	const { tab, setTabs, setTab, setTabIndex, reset } = context
	const [initialized, setInitialized] = useState(false)
	tabs = useConsistentValue(getOrderedTabs(tabs))

	// On mounting and dismounting, apply the initial tab.
	useUpdater(() => {
		if (initialTab && tabs.includes(initialTab))
			setTab(initialTab)
		setInitialized(true)
		return () => {
			reset()
			setInitialized(false)
		}
	}, [])

	// On a change in tabs, update the tabs.
	useUpdater(() => {
		setTabs(tabs)
	}, [tabs])

	// If the old tab is not valid, reset to the initial tab, or otherwise the first tab.
	useUpdater(() => {
		if (tabs.length > 0 && (!tab || !tabs.includes(tab))) {
			if (initialTab && tabs.includes(initialTab))
				setTab(initialTab)
			else
				setTabIndex(0)
		}
	}, [tab, tabs])

	// Return the context for further application. When initializing has not finished, do not include the tab data, since it may be from the previous component, whose dismounting still needs to be applied.
	return initialized ? context : { ...context, tab: undefined, tabIndex: undefined, tabs: [] }
}
