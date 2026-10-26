import React from 'react'
import { Typography } from '@mui/material'

import { withTranslation } from '@step-wise/i18n'

import { startMarginFix } from 'ui/theme'

function HeadBase({ children, sx, ...props }) {
	return <Typography variant="h5"
		sx={{
			fontWeight: 500,
			margin: '1rem 0',
			padding: '0.05px 0',
			...startMarginFix('', 0),
			...sx,
		}}
		{...props}>
		{children}
	</Typography>
}
export const Head = withTranslation(HeadBase, { tag: 'head' })
