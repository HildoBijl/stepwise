import React from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { ApolloProvider } from '@apollo/client/react'
import { HelmetProvider } from 'react-helmet-async'

import { I18nProvider as TranslationProvider } from '@step-wise/i18n'

import { useUser, ActiveGroupProvider, SkillLevelProvider } from 'api'
import { I18nProvider, useLanguage, useLanguageSetting } from 'i18n'
import { defaultLanguage } from 'i18n/settings'
import { loadCatalog, registerSource } from 'i18nNext'
import theme from 'ui/theme'

import { PrivacyPolicyWrapper } from './PrivacyPolicy'
import { Routing } from './Routing'

function UserLanguageSynchronizer() {
	const user = useUser()
	useLanguageSetting(user?.language)
	return null
}

function ApplicationTranslationProvider({ children }) {
	const language = useLanguage()
	return <TranslationProvider locale={language} sourceLocale={defaultLanguage} loadCatalog={loadCatalog} registerSource={registerSource}>{children}</TranslationProvider>
}

export function App({ apolloClient }) {
	return (
		<ApolloProvider client={apolloClient}>
			<HelmetProvider>
				<I18nProvider>
					<ApplicationTranslationProvider>
						<ThemeProvider theme={theme}>
							<CssBaseline />
							<UserLanguageSynchronizer />
							<div id="app">
								<div id="appInner">
									<PrivacyPolicyWrapper>
										<ActiveGroupProvider>
											<SkillLevelProvider>
												<Routing />
											</SkillLevelProvider>
										</ActiveGroupProvider>
									</PrivacyPolicyWrapper>
								</div>
							</div>
						</ThemeProvider>
					</ApplicationTranslationProvider>
				</I18nProvider>
			</HelmetProvider>
		</ApolloProvider>
	)
}
