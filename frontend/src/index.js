import React from 'react'
import ReactDOM from 'react-dom/client'

import { createApolloClient } from './api/apolloClient'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import { App } from './ui/layout'

// React. Do not use strict mode to prevent Material UI from bugging out.
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App apolloClient={createApolloClient()} />)

// Service worker.
serviceWorkerRegistration.register()
