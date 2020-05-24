import { createMuiTheme } from '@material-ui/core/styles'

const themeColor = '#0a6f3c'
const theme = createMuiTheme({
  palette: {
    primary: {
      main: themeColor,
    },
    secondary: {
      main: '#654321',
		},
		success: {
			main: themeColor,
		},
	},
	appWidth: 'xl', // The width that is used for the app by default.
})
export default theme

const center = {
	left: '50%',
	position: 'absolute',
	top: '50%',
	transform: 'translate(-50%, -50%)',
	width: '100%',
}
export { center }
