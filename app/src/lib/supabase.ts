import { createClient } from '@supabase/supabase-js'

// As chaves vêm das variáveis de ambiente (.env). A anon key é pública por
// design — a segurança real está nas políticas RLS do banco (schema.sql).
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Enquanto o Supabase não está configurado, o app roda em MODO DEMO
// (dados fictícios locais). Assim que as chaves entram, vira sistema real.
export const MODO_DEMO = !url || !anon

export const supabase = MODO_DEMO
  ? null
  : createClient(url!, anon!, { auth: { persistSession: true, autoRefreshToken: true } })
