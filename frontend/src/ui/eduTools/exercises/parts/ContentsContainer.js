import React, { useState } from 'react'
import { Collapse, Box } from '@mui/material'
import { ArrowRight, Refresh } from '@mui/icons-material'

import { notSelectable } from 'ui/theme'
import { Button } from 'ui/components'

export function ContentsContainer({ children, display = true, text, onClick, initialExpand = true, canToggle, color, Icon = ArrowRight, rotateIcon, refresh }) {
	// Allow for toggles, if desired.
	let [expand, setExpand] = useState()
	const toggle = () => setExpand(!expand)
	expand = expand === undefined ? initialExpand : expand

	// Check what to do when clicked on.
	onClick = onClick || (canToggle ? toggle : undefined)
	rotateIcon = rotateIcon !== undefined ? rotateIcon : canToggle
	const clickable = !!onClick

	return <Collapse in={display}>
		{!display ? null :
			<Box sx={{ margin: '0 0 0.5em 0' }}>
				<Box onClick={onClick} sx={theme => ({
					alignItems: 'center',
					color: getColor(color, theme),
					cursor: clickable ? 'pointer' : 'auto',
					display: 'flex',
					flexFlow: 'row nowrap',
					width: '100%',
					...notSelectable,
				})}>
					<Box sx={{ flex: '0 0 auto', lineHeight: 0 }}>
						<Icon sx={theme => ({ transform: (rotateIcon && expand) ? 'rotate(90deg)' : 'none', transition: `transform ${theme.transitions.duration.standard}ms` })} />
					</Box>
					<Box sx={{ fontWeight: 'bold', flex: '0 0 auto', margin: '0 0.8em 0 0.2em' }}>{text}</Box>
					<Box sx={theme => ({ borderTop: `1px solid ${getColor(color, theme)}`, flex: '1 1 auto' })} />
					{refresh ? <RefreshButton onClick={refresh} sx={{ minWidth: 'auto', marginLeft: '1rem', padding: '2px 4px' }} /> : null}
				</Box>
				<Collapse in={expand}>
					<Box sx={{ alignItems: 'stretch', display: 'flex', flexFlow: 'row nowrap' }}>
						<Box onClick={onClick} sx={{ cursor: clickable ? 'pointer' : 'auto', flex: '0 0 auto', margin: '0 0.5em 0 0', ...notSelectable }}>
							<Box sx={theme => ({ borderRight: `1px solid ${getColor(color, theme)}`, height: '100%', margin: '0 0.75rem 0 calc(0.75rem - 1px)' })} />
						</Box>
						{children ? <Box sx={{ flex: '1 1', minWidth: 0, padding: 0 }}>{children}</Box> : null}
					</Box>
				</Collapse>
			</Box>}
	</Collapse>
}

function getColor(color, theme) {
	return color ? theme.palette[color].main : theme.palette.text.primary
}

function RefreshButton(props) {
	return <Button size="small" variant="contained" color="info" {...props}><Refresh /></Button>
}
