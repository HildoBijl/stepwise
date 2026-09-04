import React from 'react'
import { Box, Container, Grid, Stack } from '@mui/material'

import { websiteName, websiteNameAddendum } from 'settings'
import { useTextTranslator } from 'i18n'
import logo from 'ui/images/logoAlternate.svg'
import { Rectangle } from 'ui/components'

export function TitleBar() {
	// Load language-dependent texts.
	const translate = useTextTranslator('main')
	const websiteNameTranslation = translate(websiteName, 'websiteName')
	const websiteNameAddendumTranslation = translate(websiteNameAddendum, 'websiteNameAddendum')

	return <Container maxWidth='lg' sx={{ flexFlow: 'row nowrap', flexDirection: 'row-reverse', paddingBottom: 'min(2vw,25px)' }}>
		<Grid container direction="row">
			<Grid size={4} sx={{ padding: 'min(3vw,38px)' }}>
				<Rectangle aspectRatio={0.8}>
					<img src={logo} className="logoPicture" alt="Step-Wise Logo" width="100%" height="100%" />
				</Rectangle>
			</Grid>
			<Grid size={8}>
				<Stack>
					<Box sx={theme => ({
						color: theme.palette.primary.contrastText,
						fontSize: 'min(9vw,116px)',
						fontWeight: '300',
						marginTop: 'min(3vw,38px)',
						position: 'relative',
						verticalAlign: 'bottom',
						'& > div': {
							bottom: 0,
							left: 0,
							position: 'absolute',
						},
					})}>
						{websiteNameTranslation}
					</Box>
					<Box sx={theme => ({
						color: theme.palette.secondary.main,
						fontSize: 'min(3.5vw,45px)',
						fontWeight: '300',
					})}>
						{websiteNameAddendumTranslation}
					</Box>
				</Stack>
			</Grid>
		</Grid>
	</Container>
}
