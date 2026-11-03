import { Routes, Route } from 'react-router-dom'
import './App.css'

import Login from './pages/Login'
import Register from './pages/Register'
import Users from './pages/Users'
import Home from './pages/Home'
import Profile from './pages/Profile'
import SearchRecetasFab from './pages/SearchRecetasFab'
import Dashboard from './pages/Dashboard'
import RecetaFabReport from './pages/RecetaFabReport'
import RecetaCipReport from './pages/RecetaCipReport'
import SearchRecetasCip from './pages/SearchRecetasCip'
import AutoclaveReport from './pages/AutoclaveReport'
import PrivateRoute from './components/PrivateRoute'
import Menu from './components/Menu'
import IdleTimeOutHandler from './components/IdleTimeOutHandler'
import { AuthContextProvider } from './context/AuthContext'
import { env } from './lib/env'

export default function App() {
  return (
    <AuthContextProvider>
      <div className="antialiased relative min-h-screen w-full bg-brand-canvas py-4 text-brand-ink">
        <Menu />
        <IdleTimeOutHandler timeOutInterval={env.TIMEOUT_SESSION} />
        <main className="justify-content-md-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route path="/register" element={<Register />} />
              <Route path="/users" element={<Users />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/recetasFab" element={<SearchRecetasFab />} />
              <Route path="/recetasCip" element={<SearchRecetasCip />} />
              <Route path="/recetaFabReport/:id" element={<RecetaFabReport />} />
              <Route path="/recetaCipReport/:id" element={<RecetaCipReport />} />
              <Route path="/autoclaves/reportes" element={<AutoclaveReport />} />
              <Route path="/autoclaves/reportes/:loteId" element={<AutoclaveReport />} />
            </Route>
          </Routes>
        </main>
      </div>
    </AuthContextProvider>
  )
}
