import { createContext, useContext } from 'react'

// Set up a context so elements inside the drawing can ask for the drawing.
export const DrawingContext = createContext({})

// Get the data out of the context.
export function useDrawingContext() {
	return useContext(DrawingContext)
}

// Get the ID of the surrounding drawing.
export function useDrawingId() {
	return useDrawingContext()?.id
}

// Get the transformation settings from the drawing context.
export function useTransformationSettings() {
	return useDrawingContext()?.transformationSettings
}

// Get specifically the bounds from the drawing context.
export function useBounds() {
	return useTransformationSettings()?.bounds
}

// Get specifically the graphicalBounds from the drawing context.
export function useGraphicalBounds() {
	return useTransformationSettings()?.graphicalBounds
}
