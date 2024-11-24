import React from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './styles/index.scss'
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
