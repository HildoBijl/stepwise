// Browser layout measurements can fluctuate by tiny subpixel amounts between otherwise equivalent renders.
export const drawingMeasurementToleranceInPixels = 0.1
export const drawingMeasurementEqualityOptions = { absoluteTolerance: drawingMeasurementToleranceInPixels } as const
