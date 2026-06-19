import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Registro from './pages/Registro'
import Login from './pages/Login'
import Reservas from './pages/Reservas'
import Menu from './pages/Menu'
import Chatbot from './components/Chatbot'
import Resenas from './pages/Resenas'
import AdminUsuarios from './pages/AdminUsuarios'
import AdminReportes from './pages/AdminReportes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/registro" element={<Registro />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/resenas" element={<Resenas />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/reportes" element={<AdminReportes />} />
      </Routes>
      <Chatbot />
    </BrowserRouter>
  )
}

export default App