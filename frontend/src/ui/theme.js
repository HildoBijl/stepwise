import { createMuiTheme } from '@material-ui/core/styles'

const themeColor = '#0a6f3c'
const secondaryColor = '#654321'
let theme = {
	palette: {
		primary: {
			main: themeColor,
		},
		secondary: {
			main: secondaryColor,
		},
		success: {
			main: themeColor,
		},
	},
	appWidth: 'xl', // The width that is used for the app by default.
}

theme = createMuiTheme(theme) // Turn the theme into a MUI theme object.
export default theme

// A macro for making an object unselectable, preventing a blue border around it.
const notSelectable = {
	userSelect: 'none',
	webkitTapHighlightColor: 'rgba(0,0,0,0)',
}
export { notSelectable }

// A macro for centering objects. (ToDo: do we need this?)
const center = {
	left: '50%',
	position: 'absolute',
	top: '50%',
	transform: 'translate(-50%, -50%)',
	width: '100%',
}
export { center }