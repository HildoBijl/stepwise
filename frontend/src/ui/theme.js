import { createMuiTheme } from '@material-ui/core/styles'
import { CheckCircle as SuccessIcon, Cancel as ErrorIcon, Warning as WarningIcon, Info as InfoIcon } from '@material-ui/icons'

import { toCSS } from 'util/colors'

// const themeColor = [0.01, 0.27, 0.54, 1] // #043870
// const secondaryColor = [0.26, 0.16, 0.08, 1] // #422814
// const feedbackColors = {
// 	success: [0.04, 0.44, 0.24, 1], // #0a6f3c
// 	error: [0.74, 0.06, 0.06, 1], // #bd0f0f
// 	warning: [0.84, 0.42, 0, 1], // #d66c00
// 	info: [0.02, 0.42, 0.84, 1], // #045ebd
// }
// const backgroundColor = [0.96, 0.96, 0.96, 1] // #f6f6f6
// const inputBackgroundColor = [1, 1, 1, 1] // #ffffff

const themeColor = [0.04, 0.44, 0.24, 1] // #0a6f3c
const secondaryColor = [0.26, 0.16, 0.08, 1] // #422814
const feedbackColors = {
	success: themeColor,
	error: [0.74, 0.06, 0.06, 1], // #bd0f0f
	warning: [0.84, 0.42, 0, 1], // #d66c00
	info: [0.02, 0.27, 0.54, 1], // #044488
}
const backgroundColor = [0.96, 0.96, 0.96, 1] // #f5f5f5
const inputBackgroundColor = [1, 1, 1, 1] // #ffffff

export { themeColor, secondaryColor, feedbackColors, backgroundColor, inputBackgroundColor }

let theme = {
	palette: {
		primary: {
			main: toCSS(themeColor),
		},
		secondary: {
			main: toCSS(secondaryColor),
		},
		success: {
			main: toCSS(feedbackColors.success),
		},
		error: {
			main: toCSS(feedbackColors.error),
		},
		warning: {
			main: toCSS(feedbackColors.warning),
		},
		info: {
			main: toCSS(feedbackColors.info),
		},
		background: {
			default: toCSS(backgroundColor),
			main: toCSS(backgroundColor),
		},
		inputBackground: {
			main: toCSS(inputBackgroundColor),
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

const linkStyleReset = {
	color: 'inherit',
	textDecoration: 'none',
}
export { linkStyleReset }

const centered = {
	left: '50%',
	position: 'absolute',
	top: '50%',
	transform: 'translate(-50%, -50%)',
}
export { centered }

// A macro for making first and last elements of a block not have a margin.
const startEndMarginFix = (addition = '', margin = 0) => ({
	[`&:first-child ${addition}`]: {
		marginTop: margin,
	},
	[`&:last-child ${addition}`]: {
		marginBottom: margin,
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

export function getFeedbackColor(feedbackType, theme) {
	return (theme.palette[feedbackType] && theme.palette[feedbackType].main) || theme.palette.text.primary
}
