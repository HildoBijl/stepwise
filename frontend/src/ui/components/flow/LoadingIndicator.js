import CircularProgress from '@material-ui/core/CircularProgress'

export function LoadingIndicator() {
	return <div style={{ margin: '3rem 0', display: 'flex', flexFlow: 'column nowrap', justifyContent: 'center', alignItems: 'center' }}>
		<CircularProgress color="primary" size={60} />
	</div>
}
