import React from 'react'
import { Box, Chip } from '@mui/material'
import { Face as FaceIcon } from '@mui/icons-material'

import { resolveFunctions } from 'step-wise/util'

export function MemberList({ members, sx, ...props }) {
	return <Box sx={theme => ({
		display: 'inline flex',
		justifyContent: 'flex-start',
		flexWrap: 'wrap',
		'& > *': { margin: theme.spacing(0.5) },
		...resolveFunctions(sx, theme),
	})} {...props}>
		{members.map(member => <Member key={member.id || member.userId} member={member} />)}
	</Box>
}

function Member({ member }) {
	return <Chip
		label={member.name}
		size="small"
		icon={<FaceIcon />}
		color={member.active ? 'primary' : 'secondary'}
	/>
}
