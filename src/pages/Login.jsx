import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Rocket, Briefcase, Sparkles, Users, TrendingUp, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import { useReveal } from '@/lib/useReveal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { ref: panelRef, shown: panelShown } = useReveal()
  const [mode, setMode] = useState('emprendedor') // 'emprendedor' | 'inversor'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast('Completa correo y contraseña', 'error')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast('No pudimos iniciar sesión: ' + error.message, 'error')
      return
    }
    toast('¡Bienvenido de vuelta!', 'success')
    navigate('/mi-perfil')
  }

  return (
    <div className="page auth-page auth-page-split">
      <div className="container">
        <div className="auth-split" data-mode={mode}>
          {/* Panel decorativo (solo desktop) */}
          <aside className="auth-aside" aria-hidden="true">
            <div className="auth-aside-top">
              <span className="auth-aside-logo">
                <Star size={20} /> StarU
              </span>
            </div>
            <div className="auth-aside-body">
              <h2 className="auth-aside-title">
                Donde las grandes ideas encuentran a quien las impulsa.
              </h2>
              <ul className="auth-aside-benefits">
                <li>
                  <span className="auth-aside-benefit-icon"><Sparkles size={18} /></span>
                  <div>
                    <strong>Muestra tu proyecto</strong>
                    <span>Perfil con productos, fotos y video pitch.</span>
                  </div>
                </li>
                <li>
                  <span className="auth-aside-benefit-icon"><Users size={18} /></span>
                  <div>
                    <strong>Conecta con inversores</strong>
                    <span>Llega a quienes buscan oportunidades como la tuya.</span>
                  </div>
                </li>
                <li>
                  <span className="auth-aside-benefit-icon"><TrendingUp size={18} /></span>
                  <div>
                    <strong>Haz crecer tu red</strong>
                    <span>Una comunidad que apuesta por emprender.</span>
                  </div>
                </li>
              </ul>
            </div>
          </aside>

          {/* Panel del formulario */}
          <div className="auth-form-panel">
            <div ref={panelRef} className={`auth-card auth-card-flush reveal ${panelShown ? 'reveal-in' : ''}`}>
              <div className="auth-header">
                <h1>Bienvenido de vuelta</h1>
                <p>Inicia sesión en tu cuenta de StarU</p>
              </div>

              <div className="role-toggle">
                <button
                  type="button"
                  className={`role-toggle-btn ${mode === 'emprendedor' ? 'active' : ''}`}
                  onClick={() => setMode('emprendedor')}
                >
                  <Rocket size={16} /> Emprendedor
                </button>
                <button
                  type="button"
                  className={`role-toggle-btn ${mode === 'inversor' ? 'active-inversor' : ''}`}
                  onClick={() => setMode('inversor')}
                >
                  <Briefcase size={16} /> Inversor
                </button>
              </div>

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <Label htmlFor="login-email">Correo electrónico</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" variant="gradient" size="lg" className="w-full mt-2" disabled={loading}>
                  {loading ? 'Ingresando…' : 'Iniciar Sesión'}
                </Button>
              </form>

              <p className="auth-footer">
                ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
