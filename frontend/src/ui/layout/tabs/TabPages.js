import React, { useEffect } from 'react'

import { Swiper, SwiperSlide, useSwiper } from 'swiper/react'
import 'swiper/css'

import { useConsistentValue } from 'util/react'

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
		noSwipingSelector={'.slider, .field, .input, .drawingInput'} // Prevent swiping on these elements.
	>
		<TabPagesEffect />
		{tabs.map(id => <SwiperSlide key={id}>{pages[id]}</SwiperSlide>)}
	</Swiper>
}

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
