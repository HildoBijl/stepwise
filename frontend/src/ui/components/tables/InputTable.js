import React, { Fragment } from 'react'
import { Box, useTheme } from '@mui/material'

import { startEndMarginFix } from 'ui/theme'

export default function InputTable({ fields, rowHeads, colHeads, className }) {
	const theme = useTheme()
	const numCols = fields[0].length

	// Define shared styling objects.
	const cellStyle = { placeSelf: 'start stretch' }
	const headStyle = { ...cellStyle, fontWeight: 'bold' }
	const rowHeadStyle = {
		...headStyle,
		whiteSpace: 'nowrap',
		[theme.breakpoints.down('xs')]: {
			marginLeft: '0.3rem',
			marginTop: '0.6rem',
		},
		[theme.breakpoints.up('sm')]: {
			marginTop: '1.25rem',
		},
	}
	const colHeadStyle = {
		...headStyle,
		placeSelf: 'end stretch',
		marginLeft: '0.3rem',
		[theme.breakpoints.down('xs')]: {
			display: 'none',
		},
	}

	return <Box className={className} sx={{
		display: 'grid',
		gridGap: '0.2rem 0.8rem',
		margin: '1rem 0',
		marginRight: '0.2rem',
		placeItems: 'center stretch',
		...startEndMarginFix('', '0.5rem'),
		gridTemplateColumns: 'auto', // default for very small screens
		[theme.breakpoints.down('xs')]: {
			gridTemplateColumns: '100%',
			marginLeft: '0.2rem',
		},
		[theme.breakpoints.up('sm')]: {
			gridTemplateColumns: `auto repeat(${numCols}, minmax(min(100px, 100%), 1fr))`,
		}
	}}>
		{colHeads && rowHeads ? <Box sx={{ ...rowHeadStyle, ...colHeadStyle }}></Box> : null}
		{colHeads ? colHeads.map((head, index) => <Box key={index} sx={colHeadStyle}>{head}</Box>) : null}
		{fields.map((row, rowIndex) => <Fragment key={rowIndex}>
			{rowHeads ? <Box sx={rowHeadStyle}>{rowHeads[rowIndex]}</Box> : null}
			{row.map((field, colIndex) => <Box key={colIndex} sx={cellStyle}>{field}</Box>)}
		</Fragment>)}
	</Box>
}
