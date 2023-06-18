import React, { useEffect, useRef } from 'react'
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react'
import 'swiper/swiper.min.css'

import { useConsistentValue, useResizeObserver } from 'util/react'
import { VisibleProvider } from 'ui/components'

import { getOrderedTabs } from './util'
import { useTabs, useTabContext } from './TabProvider'

export default function TabPages({ pages, initialPage }) {
	const tabs = useConsistentValue(getOrderedTabs(pages))
	const tabContext = useTabs(tabs, initialPage)

	return <Swiper
		onSlideChange={swiper => tabContext.setTabIndex(swiper.activeIndex)} // On a smartphone touch slide, also update the upper tab bar.
		simulateTouch={false} // Only slide on touch, not on mouse events.
		touchStartPreventDefault={false} // Allow a touch event to hit an input field.
		autoHeight={true} // Adapt the height to the active page.
		spaceBetween={40} // Add some margin between pages.
		noSwipingSelector={'.slider.active, .field, .input, .drawingInput'} // Prevent swiping on these elements.
	>
		<TabPagesEffect />
		{tabs.map(id => <SwiperSlide key={id}><SwipePageWrapper id={id}>{pages[id]}</SwipePageWrapper></SwiperSlide>)}
	</Swiper>
}

// The TabPagesEffect uses a React Effect to make sure the Tab bar also has the same page indicated as the page slider itself. When the user swipes on a smartphone, the bar then updates too.
function TabPagesEffect() {
	const tabContext = useTabContext()
	const swiper = useSwiper() // Possible because we are inside the Swiper.

	// Make sure the swiper swipes to the page indicated by the Tab context.
	const { tabIndex } = tabContext
	useEffect(() => {
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

	// Wrap the page in a provider indicating whether it's visible. This is then used by for instance input fields to determine whether they should react to anything.
	const visible = tab === id
	return <VisibleProvider visible={visible}><div ref={swipePageRef}>{children}</div></VisibleProvider>
}
