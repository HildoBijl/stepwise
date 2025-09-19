import { useTheme } from '@mui/material'

import { useInputData } from '../../../Input'

export function useDrawingRef() {
	return useInputData().drawingRef
}

export function useDrawing() {
	return useDrawingRef().current
}

export function useIsInDrawingInput() {
	return !!useInputData().inDrawingInput
}

export function useCurrentBackgroundColor() {
	const inDrawingInput = useIsInDrawingInput()
	const theme = useTheme()
	return inDrawingInput ? theme.palette.inputBackground.main : theme.palette.background.main
}

export function useCursorControls() {
	const { cursor, setCursor } = useInputData()
	return [cursor, setCursor]
}
