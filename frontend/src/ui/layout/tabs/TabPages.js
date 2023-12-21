import React, { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react'
import 'swiper/swiper.min.css'

import { useConsistentValue, useResizeObserver, useUpdater } from 'util'
import { TranslationSection } from 'i18n'
import { VisibleProvider } from 'ui/components'
import { useRoute, insertParametersIntoPath } from 'ui/routing'

import { getOrderedTabs, useTab } from './util'
import { useTabs, useTabContext } from './TabProvider'

export default function TabPages({ pages, initialPage, updateUrl = true }) {
	const urlTab = useTab()
	const tabs = useConsistentValue(getOrderedTabs(pages))
	const tabContext = useTabs(tabs, urlTab || initialPage)
	const { tab: contextTab, tabIndex, setTab, setTabIndex } = tabContext

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

	// If the tab context is not ready, do not display the Swiper yet. This prevents unwanted tab swipes on start-up.
	if (tabIndex === undefined)
		return null

	return <Swiper
		initialSlide={tabIndex}
		onSlideChange={swiper => setTabIndex(swiper.activeIndex)} // On a smartphone touch slide, also update the upper tab bar.
		simulateTouch={false} // Only slide on touch, not on mouse events.
		touchStartPreventDefault={false} // Allow a touch event to hit an input field.
		autoHeight={true} // Adapt the height to the active page.
		spaceBetween={40} // Add some margin between pages.
		noSwipingSelector={'.slider.active, .field, .input, .drawingInput'} // Prevent swiping on these elements.
	>
		<TabPagesEffect />
		{tabs.map(id => <SwiperSlide key={id}>
			<SwipePageWrapper id={id}>
				<TranslationSection entry={id}>
					{pages[id]}
				</TranslationSection>
			</SwipePageWrapper>
		</SwiperSlide>)}
	</Swiper>
}

// The TabPagesEffect uses a React Effect to make sure that, when the tab bar has a tab pressed, that the swiper also slides to the corresponding page.
function TabPagesEffect() {
	const tabContext = useTabContext()
	const swiper = useSwiper() // Possible because we are inside the Swiper.

	// Make sure the swiper swipes to the page indicated by the Tab context.
	const { tabIndex } = tabContext
	useEffect(() => {
		if (tabIndex !== undefined)
			swiper.slideTo(tabIndex)
	}, [swiper, tabIndex])

	return null
}

// The PageWrapper is wrapped around every swiper page. It checks for resizes and ensures that the swiper updates on a resize. It does not always do this well on its own.
function SwipePageWrapper({ children, id }) {
	const swiper = useSwiper()
	const swipePageRef = useRef()
	const { tab } = useTabContext()

	// On a resize of the child, update the swiper properties.
	useResizeObserver(swipePageRef, () => swiper.update())

	// On a swipe move, throw a swipe event, so other components (for instance useBoundingClientRect) know about it.
	swiper.on('transitionStart', () => dispatchEvent(new Event('swipeStart')))
	swiper.on('setTranslate', () => dispatchEvent(new Event('swipe')))
	swiper.on('transitionEnd', () => dispatchEvent(new Event('swipeEnd')))

	// Wrap the page in a provider indicating whether it's visible. This is then used by for instance input fields to determine whether they should react to anything.
	const visible = tab === id
	return <VisibleProvider visible={visible}><div ref={swipePageRef}>{children}</div></VisibleProvider>
}
