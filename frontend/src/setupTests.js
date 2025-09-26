// jest-dom adds custom jest matchers for asserting on DOM nodes. This allows you to do things like expect(element).toHaveTextContent(/react/i). Learn more though https://github.com/testing-library/jest-dom.
import '@testing-library/jest-dom/extend-expect'

// The MUI DataGrid uses a TextEncoder that is not known to Node. Polyfill it.
import { TextEncoder, TextDecoder } from 'util'
if (!global.TextEncoder)
  global.TextEncoder = TextEncoder
if (!global.TextDecoder)
  global.TextDecoder = TextDecoder
