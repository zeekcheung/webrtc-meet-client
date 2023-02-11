import ReactDOM from 'react-dom/client'
import { Provider as StoreProvider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import 'reset-css'
import './index.css'
import reportWebVitals from './reportWebVitals'
import { router } from './routes'
import store from './store'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StoreProvider store={store}>
    <RouterProvider router={router} />
  </StoreProvider>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
