import { createMuiTheme } from '@material-ui/core/styles'
import { CheckCircle as SuccessIcon, Cancel as ErrorIcon, Warning as WarningIcon, Info as InfoIcon } from '@material-ui/icons'

const themeColor = '#0a6f3c'
const secondaryColor = '#422814'
const feedbackColors = {
	success: themeColor,
	error: '#bd0f0f',
	warning: '#d66c00',
	info: '#044488',
}
const backgroundColor = '#f6f6f6'
const inputBackgroundColor = '#ffffff'

let theme = {
	palette: {
		primary: {
			main: themeColor,
		},
		secondary: {
			main: secondaryColor,
		},
		success: {
			main: feedbackColors.success,
		},
		error: {
			main: feedbackColors.error,
		},
		warning: {
			main: feedbackColors.warning,
		},
		info: {
			main: feedbackColors.info,
		},
		background: {
			default: backgroundColor,
			main: backgroundColor,
		},
		inputBackground: {
			main: inputBackgroundColor,
		},
	},
	typography: {
		body1: {
			fontSize: '0.875rem',
		},
	},
	appWidth: 'lg', // The width that is used for the app by default.
	overrides: {
		MuiOutlinedInput: {
			input: {
				padding: '14px',
			}
		},
    MuiCssBaseline: {
      '@global': {
				// Ensure that all the container components have a 100% height, so we can show stuff at the bottom of the page.
        html: {
          height: '100%',
				},
				body: {
					height: '100%',
				},
				'#root': {
					height: '100%',
				},
				'#app': {
					height: '100%',
				},
      },
    },
  },
}

theme = createMuiTheme(theme) // Turn the theme into a MUI theme object.
export default theme

// A macro for making an object unselectable, preventing a blue border around it.
const notSelectable = {
	userSelect: 'none',
	'-webkit-tap-highlight-color': 'rgba(0,0,0,0)',
}
export { notSelectable }

// A macro for making first and last elements of a block not have a margin.
const startEndMarginFix = (addition = '') => ({
	[`&:first-child ${addition}`]: {
		marginTop: 0,
	},
	[`&:last-child ${addition}`]: {
		marginBottom: 0,
	},
})
export { startEndMarginFix }

// Define icons to be used in the app.
const Icons = {
	success: SuccessIcon,
	error: ErrorIcon,
	warning: WarningIcon,
	info: InfoIcon,
}

export function getIcon(feedbackType) {
	if (Icons[feedbackType] === undefined)
		return null
	return Icons[feedbackType]
}
