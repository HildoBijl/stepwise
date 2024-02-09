
import React from 'react'

import { makeStyles } from '@material-ui/core/styles'

import { useTranslator } from 'i18n'

import { tabData } from './tabData'

const useStyles = makeStyles((theme) => ({
	tab: {
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'row nowrap',

		'& .iconContainer': {
			marginLeft: '0',
			marginRight: ({ showLabel }) => showLabel ? '0.5rem' : '0',
			marginBottom: '2px', // For better visual alignment.

			'& svg': {
				display: 'block',
			}
		},
		'& .titleContainer': {

		},
	},
}))

export function TabLabel({ tab, showLabel, showIcon }) {
	const translate = useTranslator()

	// Extract data (icon, title) on the tab.
	const currTabData = tabData[tab]
	if (!currTabData)
		throw new Error(`Invalid tab ID: tried to extract data for a tab "${tab}" but no tab with that name is known. Use an item from the list [${Object.keys(tabData).join(', ')}].`)

	// Display the tab.
	const classes = useStyles({ showLabel })
	return <div className={classes.tab}>
		{showIcon ? <div className="iconContainer"><currTabData.icon /></div> : null}
		{showLabel ? <div className="titleContainer">{translate(currTabData.title, `tabs.${currTabData.id}`, 'navigation')}</div> : null}
	</div>
}
