import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Explore from './pages/Explore'
import Academia from './pages/Academia'
import Comunidad from './pages/Comunidad'
import Convocatorias from './pages/Convocatorias'
import MyProfile from './pages/MyProfile'
import ViewProfile from './pages/ViewProfile'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/explorar" element={<Explore />} />
        <Route path="/academia" element={<Academia />} />
        <Route path="/comunidad" element={<Comunidad />} />
        <Route path="/convocatorias" element={<Convocatorias />} />
        <Route path="/perfil/:id" element={<ViewProfile />} />
        <Route
          path="/mi-perfil"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Landing />} />
      </Routes>
      <Footer />
    </>
  )
}
