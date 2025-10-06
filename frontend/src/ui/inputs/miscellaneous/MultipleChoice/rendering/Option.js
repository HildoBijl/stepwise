import React from 'react'
import { Box, alpha } from '@mui/material'

import { resolveFunctions } from 'step-wise/util'

import { notSelectable } from 'ui/theme'

export function Option({ checked, activate, deactivate, toggle, Element, feedback, readOnly, children, sx }) {
	const { type: feedbackType, text: feedbackText, Icon, color: feedbackColor } = feedback || {}
	const hasFeedback = (feedbackType && feedbackType !== 'normal')
	const handleChange = (evt, check) => check ? activate() : deactivate()

	return <>
		<Box boxShadow={1} onClick={toggle} sx={theme => ({
			alignItems: 'center',
			background: !feedbackType || feedbackType === 'normal' ? alpha(theme.palette.info.main, 0.1) : alpha(feedbackColor, 0.1),
			borderRadius: '0.5rem',
			color: feedbackColor || 'inherit',
			cursor: readOnly ? 'auto' : 'pointer',
			display: 'flex',
			flexFlow: 'row nowrap',
			justifyContent: 'flex-start',
			marginTop: '0.6rem',
			padding: '0.4rem',
			transition: `background ${theme.transitions.duration.standard}ms`,
			'&:first-of-type': { marginTop: 0 },
			...notSelectable,
			...(checked && hasFeedback ? {
				background: !feedbackType || feedbackType === 'normal' ? alpha(theme.palette.info.main, 0.2) : alpha(feedbackColor, 0.2),
			} : {}),
			'&:hover': {
				...(readOnly ? {} : {
					background: !feedbackType || feedbackType === 'normal' ? alpha(theme.palette.info.main, 0.2) : alpha(feedbackColor, 0.2),
				}),
			},
			...resolveFunctions(sx, theme),
		})}>
			<Element color="default" checked={checked} onChange={handleChange} disabled={readOnly} sx={theme => ({
				flex: '0 0 auto',
				transition: `color ${theme.transitions.duration.standard}ms`,
				color: feedbackColor || theme.palette.info.main,
				'&.Mui-disabled': {
					color: feedbackColor || theme.palette.info.main, // Hard override to prevent the disabled look on read-only.
				},
			})} />
			<Box sx={theme => ({
				flex: '1 1 auto',
				margin: '0.5rem',
				transition: `color ${theme.transitions.duration.standard}ms`,
				...notSelectable,
			})}>{children}</Box>
			{Icon ? <Icon sx={theme => ({
				flex: '0 0 auto',
				margin: '0.4rem 0.6rem',
				transition: `color ${theme.transitions.duration.standard}ms`,
			})} /> : null}
		</Box>
		{feedbackText ? <Box sx={theme => ({
			color: feedbackColor || 'inherit',
			fontSize: '0.75em',
			letterSpacing: '0.03em',
			lineHeight: 1.2,
			padding: '0.3em 1.2em 0',
			transition: `color ${theme.transitions.duration.standard}ms`,
		})}>{feedbackText}</Box> : null}
	</>
}
