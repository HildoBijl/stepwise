import React, { useState } from 'react'
import { useTheme, AppBar, Toolbar, Container } from '@mui/material'

import { TranslationCatalog, TranslationFolder } from '@step-wise/i18n'

import { Title, TabBar } from 'ui/routingTools'
import { GroupIndicator } from 'ui/pages'

import Menu from './Menu'

export function Header({ Indicator }) {
	const theme = useTheme()
	const [titleCollapsed, setTitleCollapsed] = useState(false)

	return (
		<TranslationFolder path={[]} extend={false}>
			<TranslationCatalog name="navigation">
				<AppBar data-scroll-header position="sticky">
					<Container maxWidth={theme.appWidth}>
						<Toolbar disableGutters sx={{ p: 0 }}>
							<Menu titleCollapsed={titleCollapsed} sx={{ mr: 2 }} />
							<Title setTitleCollapsed={setTitleCollapsed} sx={{ flex: 1 }} />
							{Indicator ? <Indicator /> : null}
							<GroupIndicator />
						</Toolbar>
					</Container>
					<TabBar />
				</AppBar>
			</TranslationCatalog>
		</TranslationFolder>
	)
}
