import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useConsistentValue, useUpdater } from 'util/index' // Unit test import issue: use 'util/index' because the test runner otherwise resolves Node's built-in util package.
import { TranslationSection } from 'i18n'
import { VisibleProvider } from 'ui/components'
import { useRoute, insertParametersIntoPath } from 'ui/routingTools'

import { getOrderedTabs, useTab } from './util'
import { useTabs } from './TabProvider'

function useTabScrollPositions(tab) {
	const scrollPositions = useRef({})
	const activeTab = useRef()
	const previousTab = useRef()

	useEffect(() => {
		const storeScrollPosition = () => {
			if (activeTab.current)
				scrollPositions.current[activeTab.current] = window.scrollY
		}
		window.addEventListener('scroll', storeScrollPosition, { passive: true })
		return () => window.removeEventListener('scroll', storeScrollPosition)
	}, [])

	useLayoutEffect(() => {
		if (!tab || previousTab.current === tab)
			return

		activeTab.current = tab
		previousTab.current = tab
		window.scrollTo({ top: scrollPositions.current[tab] ?? 0 })
	}, [tab])
}

export function TabPages({ pages, initialPage, updateUrl = true }) {
	const urlTab = useTab()
	const tabs = useConsistentValue(getOrderedTabs(pages))
	const tabContext = useTabs(tabs, urlTab || initialPage)
	const { tab: contextTab, tabIndex, setTab } = tabContext
	useTabScrollPositions(contextTab)

	// When the tab mentioned in the URL changes, and when it's something unequal to the context tab, adjust the context tab. (But only when it exists.)
	useUpdater(() => {
		if (urlTab !== contextTab && tabs.includes(urlTab))
			setTab(urlTab)
	}, [urlTab])

	// When the tab from the context changes, and when it's different from the tab in the URL, and when we want to update the URL, actually update the URL.
	const navigate = useNavigate()
	const params = useParams()
	const route = useRoute()
	useUpdater(() => {
		if (contextTab && contextTab !== urlTab && updateUrl) {
			const path = route.path.includes(':tab') ? route.path : `${route.path}/:tab` // Make sure the route has a "tab" parameter. If it does not exist, add it to the end.
			const pathWithParams = insertParametersIntoPath({ ...params, tab: contextTab }, path)
			navigate(pathWithParams, { replace: true })
		}
	}, [contextTab])

	// If the tab context is not ready, do not display the pages yet. This prevents the wrong page from briefly appearing on start-up.
	if (tabIndex === undefined)
		return null

	// Keep all pages mounted so switching tabs preserves their local state, but only display and activate the selected page.
	return <>
		{tabs.map(id => <div key={id} hidden={contextTab !== id}>
			<VisibleProvider visible={contextTab === id}>
				<TranslationSection entry={id === 'example' ? 'practice' : id}>{/* The example page puts its translations in the practice section too, since they're also exercises. */}
					{pages[id]}
				</TranslationSection>
			</VisibleProvider>
		</div>)}
	</>
}
