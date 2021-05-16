import React from 'react'

import Arrow from 'ui/components/icons/Arrow'

import ContentsContainer from './ContentsContainer'

export default function SolutionContainer(props) {
	return <ContentsContainer
		{...props}
		Icon={Arrow}
		canToggle={true}
		color="success"
		text={'Oplossing'} />
}