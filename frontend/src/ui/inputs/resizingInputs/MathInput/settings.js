// These are some settings about cursor dimensions.
export const maxCursorHeight = 20
export const emptyElementCursorHeight = 16

// These are settings that are used internally in how we detect elements inside equations.
export const emptyElementChar = '‘' // We use this character to put in empty elements, instead of leaving them empty. By having this char, we can find the respective element afterwards.
export const emptyElementCharLatex = '\\!{\\color{#ffffff}`}\\!' // Make it white and add negative space around to only minimally change the layout.
