import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { Button, ThemeProvider } from '@mui/material'
import { muiTheme } from './utils/ideographTheme'

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={muiTheme}>
            <Provider store={store}>
                <App />
            </Provider>
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('ideograph-app')
)
