import React, { useState, Fragment } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'
import clsx from 'clsx'

import { HorizontalSlider } from '../layout'

const useStyles = makeStyles((theme) => ({
	table: {
		display: 'grid',
		gridGap: '0.3rem',
		margin: '0.5rem 0',
		placeItems: 'stretch stretch',
		gridTemplateColumns: ({ hasRowHeads, numCols }) => `${hasRowHeads ? 'auto' : ''} repeat(${numCols}, minmax(min(4rem, 100%), 1fr))`,
		width: '100%',

		'& .cell': {
			alignItems: 'center',
			background: alpha(theme.palette.primary.main, 0.05),
			borderRadius: '0.3rem',
			display: 'flex',
			flexFlow: 'row nowrap',
			justifyContent: 'center',
			padding: '0.6rem',

			'&.rowHead, &.colHead': {
				fontWeight: 'bold',
				'& .katex': {
					fontWeight: 'bold', // Fix/overwrite to also get equations bold.
				},
			},
			'&.rowHead': {
				whiteSpace: 'nowrap',
			},
			'&.colHead': {},
			'&.rowHead.colHead': {
				background: 'transparent',
			},
			'&.alignLeft': {
				justifyContent: 'flex-start',
			},
			'&.alignRight': {
				justifyContent: 'flex-end',
			},
			'&.alignTop': {
				alignItems: 'flex-start',
			},
			'&.alignBottom': {
				alignItems: 'flex-end',
			},

			'&.hover1': {
				background: alpha(theme.palette.primary.main, 0.1),
			},
			'&.hover2': {
				background: alpha(theme.palette.primary.main, 0.2),
			},

			'& .cellInner': {},
		},
	},
}))


export default function Table({ fields, rowHeads, colHeads, rowHeadAlign = 'l', colHeadAlign = 'c', rowAlign = 'c', colAlign = rowHeads ? 'c' : 'lc', className, style }) {
	// Check what has been given.
	const numRows = fields.length
	const numCols = fields[0].length
	const hasRowHeads = !!rowHeads
	const hasColHeads = !!colHeads

	// Process the alignment.
	colAlign = fillUpAlign(colAlign, numCols)
	rowAlign = fillUpAlign(rowAlign, numRows)

	// Set up state tracking for hover actions.
	const [hover, setHover] = useState()

	// Render the table.
	const classes = useStyles({ hasRowHeads, hasColHeads, numRows, numCols, rowHeadAlign, colHeadAlign, rowAlign, colAlign })
	return (
		<HorizontalSlider>
			<div className={clsx(classes.table, 'table', className)} style={style}>
				{colHeads && rowHeads ? <Cell row="head" col="head" /> : null}
				{colHeads ? colHeads.map((head, col) => <Cell key={col} row="head" col={col} horizontalAlign={colAlign[col]} verticalAlign={colHeadAlign} hover={hover} setHover={setHover}>{head}</Cell>) : null}
				{fields.map((rowFields, row) => <Fragment key={row}>
					{rowHeads ? <Cell row={row} col="head" horizontalAlign={rowHeadAlign} verticalAlign={rowAlign[row]} hover={hover} setHover={setHover}>{rowHeads[row]}</Cell> : null}
					{rowFields.map((field, col) => <Cell key={col} row={row} col={col} horizontalAlign={colAlign[col]} verticalAlign={rowAlign[row]} hover={hover} setHover={setHover}>{field}</Cell>)}
				</Fragment>)}
			</div>
		</HorizontalSlider>
	)
}

function Cell({ row, col, horizontalAlign, verticalAlign, children, hover, setHover }) {
	const numHovers = hover ? ((hover[0] === row ? 1 : 0) + (hover[1] === col ? 1 : 0)) : 0
	return <div className={clsx(
		'cell',
		row === 'head' ? 'colHead' : `row${row}`,
		col === 'head' ? 'rowHead' : `col${col}`,
		horizontalAlign === 'l' ? 'alignLeft' : horizontalAlign === 'r' ? 'alignRight' : false,
		verticalAlign === 't' ? 'alignTop' : verticalAlign === 'b' ? 'alignBottom' : false,
		numHovers === 0 ? false : `hover${numHovers}`
	)} onMouseEnter={() => setHover && setHover([row, col])} onMouseLeave={() => setHover && setHover()}>
		<div className="cellInner">
			{children}
		</div>
	</div>
}

function fillUpAlign(align, num) {
	return align + new Array(num - align.length).fill(align.slice(-1)).join('')
}
