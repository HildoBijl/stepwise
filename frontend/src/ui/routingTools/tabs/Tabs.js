import React, { useRef } from 'react'
import { Tabs as MuiTabs, Tab as MuiTab, useTheme } from '@mui/material'

import { useDimension, useResizeListener } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

import { useTabContext } from './TabProvider'
import { TabLabel } from './TabLabel'

// Define limits on tab width where tabs switch their contents.
const lowerTabWidthLimit = 110 // Below this there is only an icon. Above this there is text.
const upperTabWidthLimit = 145 // Below this there is only text, above this there is both an icon and text.

export function Tabs() {
	const theme = useTheme()
	const { tabs, tabIndex, setTabIndex } = useTabContext()

	// Determine based on the width of the tabs bar whether labels should be shown.
	const tabsRef = useRef()
	const width = useDimension(tabsRef, 'offsetWidth', useResizeListener)
	let showIcon = true, showLabel = true
	if (width / tabs.length < lowerTabWidthLimit)
		showLabel = false
	else if (width / tabs.length < upperTabWidthLimit)
		showIcon = false

	// On zero or one tabs, do not show the tabs.
	if (tabs.length === 0 || tabs.length === 1)
		return null

	return <MuiTabs
		ref={tabsRef}
		value={tabIndex}
		onChange={(event, newValue) => setTabIndex(newValue)}
		variant="fullWidth"
		textColor="inherit"
		TabIndicatorProps={{ style: { backgroundColor: theme.palette.background.main } }} // Color of the active tab indicator line.
	>
		{tabs.map((tab, index) => <MuiTab key={index} label={<TabLabel {...{ tab, showLabel, showIcon }} />} sx={{ minWidth: '0' }} />)}
	</MuiTabs>
}
