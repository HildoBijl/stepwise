import { Box } from '@mui/material'

import { ProgressIndicator } from 'ui/components'

export function CenteredProgressIndicator(props) {
	return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
		<ProgressIndicator {...props} />
	</Box>
}
