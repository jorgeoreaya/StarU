import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserX } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProfileDetail from '../components/ProfileDetail'
import { Button } from '@/components/ui/button'
import '../components/ProfileDetail.css'

export default function ViewProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      let prods = []
      if (prof && prof.role === 'emprendimiento') {
        const { data } = await supabase.from('products').select('*').eq('profile_id', id)
        prods = data ?? []
      }
      if (active) {
        setProfile(prof ?? null)
        setProducts(prods)
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  return (
    <div className="page profile-page">
      <div className="container">
        <Button variant="ghost" className="btn-back" onClick={() => navigate('/explorar')}>
          <ArrowLeft size={16} /> Volver a explorar
        </Button>
        {loading ? (
          <div className="spinner" />
        ) : !profile ? (
          <div className="empty-state">
            <div className="empty-icon"><UserX size={48} /></div>
            <h3>Perfil no encontrado</h3>
          </div>
        ) : (
          <ProfileDetail profile={profile} products={products} />
        )}
      </div>
    </div>
  )
}
