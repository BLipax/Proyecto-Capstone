import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import AdminAgregarPlato from './pages/AdminAgregarPlato'
import AdminEditarMenu from './pages/AdminEditarMenu'
// import ProtectedRoute from './components/ProtectedRoute'
import AdminReservas from './pages/AdminReservas'
import AdminMenuDia from './pages/AdminMenuDia'
import MisReservas from './pages/MisReservas'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/home" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        <Route path="/resenas" element={<Resenas />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/reportes" element={<AdminReportes />} />
        <Route path="/admin/agregar-plato" element={<AdminAgregarPlato />} />
        <Route path="/admin/editar-menu" element={<AdminEditarMenu />} />
        <Route path="/admin/reservas" element={<AdminReservas />} />
        <Route path="/admin/menu-dia" element={<AdminMenuDia />} />
      </Routes>
      <Chatbot />
    </BrowserRouter>
  )
}

export default App