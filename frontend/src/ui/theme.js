import { useMemo } from 'react'
import { createTheme, useTheme, alpha } from '@mui/material'
import { CheckCircle as SuccessIcon, Cancel as ErrorIcon, Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material'

import { toHex, toCSS, useFontFaceObserver } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

const themeColor = [0.05, 0.5, 0.26, 1] // #0d8042
const secondaryColor = [0.26, 0.16, 0.08, 1] // #422814
const feedbackColors = {
	success: themeColor,
	error: [0.74, 0.06, 0.06, 1], // #bd0f0f
	warning: [0.84, 0.42, 0, 1], // #d66c00
	info: [0.02, 0.27, 0.54, 1], // #044488
}
const backgroundColor = [0.96, 0.96, 0.96, 1] // #f5f5f5
const inputBackgroundColor = [1, 1, 1, 1] // #ffffff

const colors = {
	primary: themeColor,
	secondary: secondaryColor,
	...feedbackColors,
	background: backgroundColor,
	inputBackground: inputBackgroundColor
}

export { themeColor, secondaryColor, feedbackColors, backgroundColor, inputBackgroundColor, colors }

let theme = {
	palette: {
		primary: { main: toCSS(themeColor) },
		secondary: { main: toCSS(secondaryColor) },
		success: { main: toCSS(feedbackColors.success) },
		error: { main: toCSS(feedbackColors.error) },
		warning: { main: toCSS(feedbackColors.warning) },
		info: { main: toCSS(feedbackColors.info) },
		background: {
			default: toCSS(backgroundColor),
			main: toCSS(backgroundColor),
		},
		inputBackground: { main: toCSS(inputBackgroundColor) },
	},
	typography: {
		body1: { fontSize: '0.875rem' },
	},
	appWidth: 'lg', // The width that is used for the app by default.
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				html: { height: '100%' },
				body: { height: '100%' },
				'#root': { height: '100%' },
				'#app': { height: '100%' },
			},
		},
	},
}

theme = createTheme(theme) // Turn the theme into a MUI theme object.
export default theme

// The style for a page container.
const pageContainerStyle = {
	marginTop: theme.spacing(2),
	paddingBottom: '0.5rem', // Use padding to ensure that bottom elements inside this page can show their margin.
}
export { pageContainerStyle }

// A macro for making an object unselectable, preventing a blue border around it.
const notSelectable = {
	userSelect: 'none',
	WebkitTapHighlightColor: 'rgba(255, 0, 0, 0)',
}
export { notSelectable }

const linkStyle = {
	color: alpha(theme.palette.text.primary, 0.6),
	fontWeight: 600,
	textDecoration: 'none',

	'&:hover': {
		color: theme.palette.text.primary,
	},
}
export { linkStyle }

const linkStyleReset = {
	color: 'inherit',
	fontWeight: 'normal',
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
export const startMarginFix = (addition = '', margin = 0) => ({
	[`&:first-of-type ${addition}`]: {
		marginTop: margin,
	},
})
export const endMarginFix = (addition = '', margin = 0) => ({
	[`&:last-of-type ${addition}`]: {
		marginBottom: margin,
	},
})
export const startEndMarginFix = (addition, margin) => ({
	...startMarginFix(addition, margin),
	...endMarginFix(addition, margin),
})

// Easy ways of accessing colors.
export function usePrimaryColor() {
	return useTheme().palette.primary.main
}

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
	if (Array.isArray(feedbackType))
		return feedbackType.map(feedbackType => getFeedbackColor(feedbackType, theme))
	return (theme.palette[feedbackType] && theme.palette[feedbackType].main) || theme.palette.text.primary
}

export function useColor(color) {
	const theme = useTheme()
	return getFeedbackColor(color, theme)
}

export function getHexColor(color) {
	if (Array.isArray(color))
		return color.map(color => getHexColor(color))
	if (!colors[color])
		throw new Error(`Invalid color name: tried to get the hex code for the color "${color}" but this color was not known.`)
	return toHex(colors[color])
}

export function useFontsLoaded(includeMaths = true) {
	const theme = useTheme()
	const fontFamily = theme.typography.fontFamily
	const firstFontFamily = useMemo(() => fontFamily.split('"').find(str => str.length > 0), [fontFamily])
	const fonts = [{ family: firstFontFamily }]
	if (includeMaths)
		fonts.push({ family: 'KaTeX_Math' })
	return useFontFaceObserver(fonts)
}
