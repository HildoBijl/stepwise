import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

import ContentsContainer from './ContentsContainer'

export default function SolutionContainer(props) {
	return <ContentsContainer
		{...props}
		Icon={Arrow}
		canToggle={true}
		color="primary"
		text={'Oplossing'} />
}

function Arrow(props) {
	return (
		<SvgIcon {...props}>
			<path d="M9 18 l6 -6 -6 -6 v12z" fill="currentColor" />
		</SvgIcon>
	)
}