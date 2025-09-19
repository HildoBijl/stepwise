import React from 'react'
import { useTheme, Container } from '@mui/material'

import { pageContainerStyle, linkStyle } from 'ui/theme'

export function PageContainer({ children }) {
	const theme = useTheme()
	return <Container maxWidth={theme.appWidth} sx={{ ...pageContainerStyle, '& a': linkStyle }}>{children}</Container>
}
