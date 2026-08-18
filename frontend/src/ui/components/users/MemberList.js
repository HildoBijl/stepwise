import React from 'react'
import { Box, Chip } from '@mui/material'
import { Face as FaceIcon } from '@mui/icons-material'

import { resolveFunctionValuesDeep } from '@step-wise/js-utils'

export function MemberList({ members, sx, ...props }) {
	return <Box sx={theme => ({
		display: 'inline flex',
		justifyContent: 'flex-start',
		flexWrap: 'wrap',
		'& > *': { margin: theme.spacing(0.5) },
		...resolveFunctionValuesDeep(sx, theme),
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
