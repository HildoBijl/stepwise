import React, { Fragment } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { startEndMarginFix } from 'ui/theme'

const useStyles = makeStyles((theme) => ({
	inputTable: {
		display: 'grid',
		gridGap: '0.2rem 0.8rem',
		margin: '1rem 0',
		marginRight: '0.2rem', // To prevent the input field drop shadow from being cut off by the hidden overflow of the vertical adjuster.
		placeItems: 'center stretch',
		...startEndMarginFix('', '0.5rem'),
		[theme.breakpoints.down('xs')]: {
			gridTemplateColumns: '100%',
			marginLeft: '0.2rem', // To prevent the input field drop shadow from being cut off by the hidden overflow of the vertical adjuster.
		},
		[theme.breakpoints.up('sm')]: {
			gridTemplateColumns: ({ numCols }) => `auto repeat(${numCols}, minmax(min(100px, 100%), 1fr))`,
		},

		'& .cell': {
			placeSelf: 'start stretch',
		},
		'& .rowHead': {
			fontWeight: 'bold',
			placeSelf: 'start stretch',
			whiteSpace: 'nowrap',
			[theme.breakpoints.down('xs')]: {
				marginLeft: '0.3rem',
				marginTop: '0.6rem',
			},
			[theme.breakpoints.up('sm')]: {
				marginTop: '1.25rem',
			},
		},
		'& .colHead': {
			fontWeight: 'bold',
			marginLeft: '0.3rem',
			placeSelf: 'end stretch',
			[theme.breakpoints.down('xs')]: {
				display: 'none',
			},
		},
	},
}))

export default function InputTable({ fields, rowHeads, colHeads, className }) {
	const numRows = fields.length
	const numCols = fields[0].length
	const classes = useStyles({ numRows, numCols })

	return (
		<div className={clsx(classes.inputTable, 'inputTable', className)}>
			{colHeads && rowHeads ? <div className="rowHead colHead"></div> : null}
			{colHeads ? colHeads.map((head, index) => <div key={index} className="colHead">{head}</div>) : null}
			{fields.map((row, rowIndex) => <Fragment key={rowIndex}>
				{rowHeads ? <div className="rowHead">{rowHeads[rowIndex]}</div> : null}
				{row.map((field, colIndex) => <div key={colIndex} className="cell">{field}</div>)}
			</Fragment>)}
		</div>
	)
}
