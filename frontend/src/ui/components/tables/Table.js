import React, { useState, Fragment } from 'react'
import { Box, alpha } from '@mui/material'

import { HorizontalSlider } from '../layout'

export default function Table({ fields, rowHeads, colHeads, rowHeadAlign = 'l', colHeadAlign = 'c', rowAlign = 'c', colAlign = rowHeads ? 'c' : 'lc', className, style }) {
	// Check what has been given.
	const numRows = fields.length
	const numCols = fields[0].length
	const hasRowHeads = !!rowHeads

	// Process the alignment.
	colAlign = fillUpAlign(colAlign, numCols)
	rowAlign = fillUpAlign(rowAlign, numRows)

	// Set up state tracking for hover actions.
	const [hover, setHover] = useState()

	// Render the table.
	return <HorizontalSlider>
		<Box className={className} style={style} sx={theme => ({
			display: 'grid',
			gridGap: '0.3rem',
			margin: '0.5rem 0',
			placeItems: 'stretch stretch',
			width: '100%',
			gridTemplateColumns: `${hasRowHeads ? 'auto ' : ''}repeat(${numCols}, minmax(auto, 1fr))`,

			'& .cell': {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexFlow: 'row nowrap',
				padding: '0.6rem',
				borderRadius: '0.3rem',
				background: alpha(theme.palette.primary.main, 0.05),

				'&.rowHead, &.colHead': {
					fontWeight: 'bold',
					'& .katex': { fontWeight: 'bold' }, // Fix/overwrite to also get equations bold.
				},
				'&.rowHead.colHead': {
					background: 'transparent',
				},
				'&.alignLeft': { justifyContent: 'flex-start' },
				'&.alignRight': { justifyContent: 'flex-end' },
				'&.alignTop': { alignItems: 'flex-start' },
				'&.alignBottom': { alignItems: 'flex-end' },

				'&.hover1': { background: alpha(theme.palette.primary.main, 0.1) },
				'&.hover2': { background: alpha(theme.palette.primary.main, 0.2) },
			},
		})}>
			{colHeads && rowHeads ? <Cell row="head" col="head" /> : null}
			{colHeads ? colHeads.map((head, col) => <Cell key={col} row="head" col={col} horizontalAlign={colAlign[col]} verticalAlign={colHeadAlign} hover={hover} setHover={setHover}>{head}</Cell>) : null}
			{fields.map((rowFields, row) => <Fragment key={row}>
				{rowHeads ? <Cell row={row} col="head" horizontalAlign={rowHeadAlign} verticalAlign={rowAlign[row]} hover={hover} setHover={setHover}>{rowHeads[row]}</Cell> : null}
				{rowFields.map((field, col) => <Cell key={col} row={row} col={col} horizontalAlign={colAlign[col]} verticalAlign={rowAlign[row]} hover={hover} setHover={setHover}>{field}</Cell>)}
			</Fragment>)}
		</Box>
	</HorizontalSlider>
}

function Cell({ row, col, horizontalAlign, verticalAlign, children, hover, setHover }) {
	const numHovers = hover ? ((hover[0] === row ? 1 : 0) + (hover[1] === col ? 1 : 0)) : 0
	const classes = [
		'cell',
		row === 'head' ? 'colHead' : `row${row}`,
		col === 'head' ? 'rowHead' : `col${col}`,
		horizontalAlign === 'l' ? 'alignLeft' : horizontalAlign === 'r' ? 'alignRight' : '',
		verticalAlign === 't' ? 'alignTop' : verticalAlign === 'b' ? 'alignBottom' : '',
		numHovers === 0 ? '' : `hover${numHovers}`,
	].join(' ')
	return <Box className={classes} onMouseEnter={() => setHover && setHover([row, col])} onMouseLeave={() => setHover && setHover()}>
		<Box className="cellInner">
			{children}
		</Box>
	</Box>
}

function fillUpAlign(align, num) {
	return align + new Array(num - align.length).fill(align.slice(-1)).join('')
}
