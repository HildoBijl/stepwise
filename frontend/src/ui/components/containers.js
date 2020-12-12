import React, { Fragment } from 'react'
import clsx from 'clsx'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import HorizontalSlider from 'ui/components/layout/HorizontalSlider'
import { startEndMarginFix } from 'ui/theme'

const useStyles = makeStyles((theme) => ({
	paragraph: {
		margin: '0.8rem 0',
		padding: '0.05px 0.2rem 0 0',
		...startEndMarginFix('', '0.5rem'),

		textAlign: 'left',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'justify',
		},
	},
	head: {
		margin: '1rem 0',
		padding: '0.05px 0',
		...startEndMarginFix('', 0),
	},
	subhead: {
		margin: '1rem 0',
		padding: '0.05px 0',
		...startEndMarginFix('', 0),
	},
	list: {
		margin: '0.5rem 0',

		'& .item': {
			margin: '0.2rem 0 0.2rem -1rem',
		},
	},
	table: {
		display: 'grid',
		gridGap: '0.6rem 0.8rem',
		margin: '0.5rem 0',
		placeItems: 'start center',
		gridTemplateColumns: ({ numCols }) => `auto repeat(${numCols}, minmax(min(100px, 100%), 1fr))`,

		'& .cell': {},
		'& .rowHead': {
			fontWeight: 'bold',
			placeSelf: 'start stretch',
			whiteSpace: 'nowrap',
		},
		'& .colHead': {
			fontWeight: 'bold',
			placeSelf: 'end center',
		},
	},
}))

export function Par({ children, className, style }) {
	const classes = useStyles()
	return <div className={clsx(classes.paragraph, 'paragraph', className)} style={style}>{children}</div>
}

export function Head({ children, className, style }) {
	const classes = useStyles()
	return <Typography variant="h5" className={clsx(classes.head, 'head', className)} style={style}>{children}</Typography>
}

export function SubHead({ children, className, style }) {
	const classes = useStyles()
	return <Typography variant="h6" className={clsx(classes.subhead, 'subhead', className)} style={style}>{children}</Typography>
}

export function List({ items, className, style }) {
	const classes = useStyles()
	return <ul className={clsx(classes.list, 'list', className)} style={style}>{items.map((item, index) => <li key={index} className="item">{item}</li>)}</ul>
}

export function Table({ fields, rowHeads, colHeads, className, style }) {
	const numRows = fields.length
	const numCols = fields[0].length
	const classes = useStyles({ numRows, numCols })

	return (
		<HorizontalSlider>
			<div className={clsx(classes.table, 'table', className)} style={style}>
				{colHeads && rowHeads ? <div className="rowHead colHead"></div> : null}
				{colHeads ? colHeads.map((head, index) => <div key={index} className="colHead">{head}</div>) : null}
				{fields.map((row, rowIndex) => <Fragment key={rowIndex}>
					{rowHeads ? <div className="rowHead">{rowHeads[rowIndex]}</div> : null}
					{row.map((field, colIndex) => <div key={colIndex} className="cell">{field}</div>)}
				</Fragment>)}
			</div>
		</HorizontalSlider>
	)
}