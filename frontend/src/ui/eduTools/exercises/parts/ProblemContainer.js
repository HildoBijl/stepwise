import React from 'react'

import { Translation } from '@step-wise/i18n'

import { Circle } from 'ui/components'

import { ContentsContainer } from './ContentsContainer'

export function ProblemContainer(props) {
	const { step, example } = props
	return <ContentsContainer
		{...props}
		Icon={Circle}
		rotateIcon={false}
		text={!step ?
			(example ? 
				<Translation folder={['eduTools']} catalog="exercises" group={[]} id="example">Example exercise</Translation> :
				<Translation folder={['eduTools']} catalog="exercises" group={[]} id="exercise">Practice exercise</Translation>) :
			<Translation folder={['eduTools']} catalog="exercises" group={[]} id="step">Step {{ step }}</Translation>}
	/>
}
