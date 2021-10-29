// Merge all file exports into one big export for easy accessing. Note the order: this is the order in which they are also defined. Bottom files may import top files but not vice versa.

export * from './evaluation' // Basic analysis without changing coefficients.
export * from './manipulation.js' // Basic changing of coefficients. Is only used internally.
export * from './smoothing' // Smoothing coefficient arrays.
export * from './dataSet' // Everything related to data sets.
export * from './combiners' // Everything related to combiners.
export * from './inference' // Making predictions of the future.
export * from './updating' // Adjusting coefficients based on observations.
