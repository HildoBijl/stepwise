import React from 'react'
import { Box } from '@mui/material'

import { withTranslation } from '@step-wise/i18n'
import { resolveFunctionValuesDeep } from '@step-wise/js-utils'

import { startEndMarginFix } from 'ui/theme'

function ParBase({ children, sx, ...props }) {
	return <Box sx={theme => ({
		margin: '0.8rem 0',
		padding: '0.05px 0.2rem 0 0',
		...startEndMarginFix('', '0.5rem'),
		textAlign: 'left',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'justify',
		},
		...resolveFunctionValuesDeep(sx, theme),
	})}	{...props}>
		{children}
	</Box>
}
export const Par = withTranslation(ParBase, { tag: 'par' })
