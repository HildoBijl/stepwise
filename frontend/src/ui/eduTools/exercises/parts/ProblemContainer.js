import React from 'react'

import { Translation } from 'i18n'
import { Circle } from 'ui/components'

import { ContentsContainer } from './ContentsContainer'

export function ProblemContainer(props) {
	const translationPath = 'eduTools/exercises'
	const { step, example } = props
	return <ContentsContainer
		{...props}
		Icon={Circle}
		rotateIcon={false}
		text={!step ?
			(example ? 
				<Translation entry="example" path={translationPath}>Example exercise</Translation> :
				<Translation entry="exercise" path={translationPath}>Practice exercise</Translation>) :
			<Translation entry="step" path={translationPath}>Step {{ step }}</Translation>}
	/>
}
