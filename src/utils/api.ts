import { supabase } from './supabase'

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message) }
}

export async function api<T>(path: string, body?: unknown, token?: string): Promise<T> {
  const accessToken = token ?? (await supabase?.auth.getSession())?.data.session?.access_token
  if (!accessToken) throw new ApiError('Sua sessão expirou. Entre novamente.', 401)
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '')
  let response: Response
  try {
    response = await fetch(`${base}${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { Authorization: `Bearer ${accessToken}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000) })
  } catch { throw new ApiError('Não foi possível conectar à API. Tente novamente.', 0) }
  const result = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(typeof result?.message === 'string' ? result.message : 'Não foi possível concluir a operação.', response.status)
  return result as T
}

export function mensagemErro(e: unknown) { return e instanceof Error ? e.message : 'Não foi possível concluir a operação.' }
