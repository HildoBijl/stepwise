import React from 'react'

import { Translation } from 'i18n'
import { Circle } from 'ui/components'

import { ContentsContainer } from './ContentsContainer'

export function ProblemContainer(props) {
	const translationPath = 'eduTools/exercises'
	const { step } = props
	return <ContentsContainer
		{...props}
		Icon={Circle}
		rotateIcon={false}
		text={!step ?
			<Translation entry="exercise" path={translationPath}>Exercise</Translation> :
			<Translation entry="step" path={translationPath}>Step {{ step }}</Translation>}
	/>
}
