import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Aviso temprano y claro en consola si faltan las credenciales.
  console.error(
    '[StarU] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
      'Copia .env.example a .env.local y pega tus credenciales de Supabase.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Buckets de Storage usados en la app.
export const BUCKETS = {
  avatars: 'avatars',
  pitches: 'pitches',
  academia: 'academia',
}

// Sube un archivo a un bucket y devuelve su URL pública.
export async function uploadFile(bucket, file, pathPrefix = '') {
  const ext = file.name.split('.').pop()
  const safePrefix = pathPrefix ? `${pathPrefix}/` : ''
  const fileName = `${safePrefix}${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return data.publicUrl
}
