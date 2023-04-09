
import React from 'react'

import { makeStyles } from '@material-ui/core/styles'

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

export default function TabLabel({ tab, showLabel, showIcon }) {
	const classes = useStyles({ showLabel })
	return <div className={classes.tab}>
		{showIcon ? <div className="iconContainer"><tab.icon /></div> : null}
		{showLabel ? <div className="titleContainer">{tab.title}</div> : null}
	</div>
}
