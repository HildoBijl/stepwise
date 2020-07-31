import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

import ContentsContainer from './ContentsContainer'

export default function ProblemContainer(props) {
	const { step } = props
	return <ContentsContainer
		{...props}
		Icon={Circle}
		rotateIcon={false}
		text={!step ? 'Opgave' : `Stap ${step}`} />
}

function Circle(props) {
	return (
		<SvgIcon {...props}>
			<circle cx="12" cy="12" r="4" fill="currentColor" />
		</SvgIcon>
	)
}