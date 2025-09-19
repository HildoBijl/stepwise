
import React from 'react'
import { Box } from '@mui/material'

import { resolveFunctions } from 'step-wise/util'

import { useTranslator } from 'i18n'

import { tabData } from './tabData'

export function TabLabel({ tab, showLabel, showIcon, sx = {} }) {
	const translate = useTranslator()

	// Extract data (icon, title) on the tab.
	const currTabData = tabData[tab]
	if (!currTabData)
		throw new Error(`Invalid tab ID: tried to extract data for a tab "${tab}" but no tab with that name is known. Use an item from the list [${Object.keys(tabData).join(', ')}].`)

	// Display the tab.
	return <Box sx={theme => ({
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'row nowrap',
		...resolveFunctions(sx, theme),
	})}>
		{showIcon ? <Box sx={{
			marginLeft: '0',
			marginRight: showLabel ? '0.5rem' : '0',
			marginBottom: '2px', // For better visual alignment.
			'& svg': { display: 'block' }
		}}>
			<currTabData.icon />
		</Box> : null}

		{showLabel ? <Box>
			{translate(currTabData.title, `tabs.${currTabData.id}`, 'navigation')}
		</Box> : null}
	</Box>
}
