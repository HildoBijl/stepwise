import React from 'react'

import { Translation } from 'i18n'
import { Arrow } from 'ui/components'

import { ContentsContainer } from './ContentsContainer'

export function SolutionContainer(props) {
	return <ContentsContainer
		{...props}
		Icon={Arrow}
		canToggle={true}
		color="success"
		text={<Translation entry="solution" path="eduTools/exercises">Solution</Translation>} />
}
