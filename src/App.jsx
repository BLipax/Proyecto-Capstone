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
import ProtectedRoute from './components/ProtectedRoute'
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
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
        <Route path="/reservas" element={<ProtectedRoute><Reservas /></ProtectedRoute>} />
        <Route path="/resenas" element={<ProtectedRoute><Resenas /></ProtectedRoute>} />
        <Route path="/mis-reservas" element={<ProtectedRoute><MisReservas /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute soloAdmin><Admin /></ProtectedRoute>} />
        <Route path="/admin/usuarios" element={<ProtectedRoute soloAdmin><AdminUsuarios /></ProtectedRoute>} />
        <Route path="/admin/reportes" element={<ProtectedRoute soloAdmin><AdminReportes /></ProtectedRoute>} />
        <Route path="/admin/agregar-plato" element={<ProtectedRoute soloAdmin><AdminAgregarPlato /></ProtectedRoute>} />
        <Route path="/admin/editar-menu" element={<ProtectedRoute soloAdmin><AdminEditarMenu /></ProtectedRoute>} />
        <Route path="/admin/reservas" element={<ProtectedRoute soloAdmin><AdminReservas /></ProtectedRoute>} />
        <Route path="/admin/menu-dia" element={<ProtectedRoute soloAdmin><AdminMenuDia /></ProtectedRoute>} />
      </Routes>
      <Chatbot />
    </BrowserRouter>
  )
}

export default App