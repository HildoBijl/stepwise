import React from 'react'

import ContentsContainer from './ContentsContainer'

export default function SolutionContainer(props) {
	return <ContentsContainer
		{...props}
		canToggle={true}
		color="primary"
		text={'Oplossing'} />
}
