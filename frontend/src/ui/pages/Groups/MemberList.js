import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import FaceIcon from '@material-ui/icons/Face'

const useStyles = makeStyles((theme) => ({
	memberList: {
		display: 'inline flex',
		justifyContent: 'center',
		flexWrap: 'wrap',
		'& > *': {
			margin: theme.spacing(0.5),
		},
	},
}))

export default function MemberList({ members, className }) {
	const classes = useStyles()
	return <div className={clsx(classes.memberList, 'memberList', className)}>
		{members.map(member => <Member key={member.userId} member={member} />)}
	</div>
}

function Member({ member }) {
	return <Chip
		label={member.name}
		size="small"
		icon={<FaceIcon />}
		color={member.active ? 'primary' : 'secondary'}
	/>
}
