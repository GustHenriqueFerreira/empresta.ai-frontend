import { useCallback, useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import Login from './features/login/Login'
import Catalogo from './features/catalogo/Catalogo'
import { MeusEmprestimos, PainelOperacoes, CadastroEquipamento } from './features/gestao/Gestao'
import NavBar from './components/NavBar'
import type { Aba } from './components/NavBar'
import { Toast } from './components/Toast'
import type { Usuario, Equipamento, Emprestimo, Operacoes, Papel, Cadastro } from './types'
import { api, ApiError, mensagemErro } from './utils/api'
import { supabase } from './utils/supabase'
import { dataExibicao } from './utils/datas'
import './features/gestao/Gestao.css'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [iniciando, setIniciando] = useState(true)
  const [erroSessao, setErroSessao] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)
  const [aba, setAba] = useState<Aba>('catalogo')
  const [toast, setToast] = useState<string | null>(null)
  const [itens, setItens] = useState<Equipamento[]>([])
  const [meus, setMeus] = useState<Emprestimo[]>([])
  const [operacoes, setOperacoes] = useState<Operacoes | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const toastTimer = useRef<number>()
  const papelPedido = useRef<Papel | null>(null)
  const identidadeAtual = useRef<string | null>(null)
  const carga = useRef(0)
  const perfilAtual = useRef<Usuario | null>(null)

  const notify = useCallback((mensagem: string) => {
    setToast(mensagem)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])
  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  useEffect(() => {
    if (!supabase) { setIniciando(false); return }
    const { data } = supabase.auth.onAuthStateChange((_event, atual) => {
      setSession(atual)
      if (!atual || identidadeAtual.current !== atual.user.id) {
        carga.current++
        identidadeAtual.current = atual?.user.id || null
        perfilAtual.current = null
        setUsuario(null); setItens([]); setMeus([]); setOperacoes(null)
      }
      setIniciando(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let ativo = true
    setErroSessao(null)
    if (!session) return
    api<Usuario>('/me', undefined, session.access_token).then(async perfil => {
      if (!ativo) return
      if (papelPedido.current === 'operacoes' && perfil.papel !== 'operacoes') {
        papelPedido.current = null
        notify('Acesso permitido somente a Operações.')
        await supabase?.auth.signOut({ scope: 'local' })
        return
      }
      if (!perfilAtual.current) setAba(perfil.papel === 'operacoes' ? 'operacoes' : 'catalogo')
      perfilAtual.current = perfil
      setUsuario(perfil)
      papelPedido.current = null
    }).catch(async e => {
      if (!ativo) return
      setUsuario(null)
      if (e instanceof ApiError && e.status === 401) { notify(e.message); await supabase?.auth.signOut({ scope: 'local' }) }
      else setErroSessao(mensagemErro(e))
    })
    return () => { ativo = false }
  }, [session?.access_token, tentativa, notify])

  const carregar = useCallback(async () => {
    if (!usuario) return
    const numero = ++carga.current
    setCarregando(true); setErro(null)
    try {
      const [catalogo, emprestimos, painel] = await Promise.all([
        api<Equipamento[]>('/equipamentos'), api<Emprestimo[]>('/emprestimos/meus'),
        usuario.papel === 'operacoes' ? api<Operacoes>('/operacoes') : Promise.resolve(null),
      ])
      if (numero !== carga.current) return
      setItens(catalogo); setMeus(emprestimos); setOperacoes(painel)
    } catch (e) {
      if (numero !== carga.current) return
      setErro(mensagemErro(e))
      if (e instanceof ApiError && e.status === 401) await supabase?.auth.signOut({ scope: 'local' })
    } finally { if (numero === carga.current) setCarregando(false) }
  }, [usuario?.id, usuario?.papel])
  useEffect(() => { void carregar(); return () => { carga.current++ } }, [carregar])

  async function entrar(email: string, senha: string, papel: Papel) {
    if (!supabase) throw new Error('Configure o Supabase no frontend/.env.')
    papelPedido.current = papel
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) { papelPedido.current = null; throw new Error(error.status === 400 ? 'E-mail ou senha inválidos.' : 'Não foi possível entrar. Tente novamente.') }
  }
  async function sair() {
    const { error } = await supabase!.auth.signOut({ scope: 'local' })
    if (error) notify('Não foi possível sair. Tente novamente.')
  }
  async function alterar<T>(requisicao: () => Promise<T>, sucesso: string | ((dado: T) => string)) {
    try {
      const resultado = await requisicao()
      notify(typeof sucesso === 'function' ? sucesso(resultado) : sucesso)
      await carregar()
    } catch (e) {
      notify(mensagemErro(e))
      if (e instanceof ApiError && e.status === 401) await supabase?.auth.signOut({ scope: 'local' })
      throw e
    }
  }

  let conteudo
  if (!supabase) conteudo = <main className="page"><p role="alert">Configure a URL e a chave pública do Supabase no frontend/.env.</p></main>
  else if (iniciando || (session && !usuario && !erroSessao)) conteudo = <main className="page" role="status">Carregando…</main>
  else if (session && erroSessao) conteudo = <main className="page page-body"><p role="alert">{erroSessao}</p><div className="actions"><button className="btn btn-primary" onClick={() => setTentativa(n => n + 1)}>Tentar novamente</button><button className="btn btn-secondary" onClick={() => void sair()}>Sair</button></div></main>
  else if (!usuario) conteudo = <Login onEntrar={entrar} />
  else conteudo = <>
    <NavBar papel={usuario.papel} abaAtiva={aba} usuario={usuario} onAba={setAba} onSair={() => void sair()} />
    {carregando ? <main className="page" role="status">Carregando…</main> : erro ? <main className="page page-body"><p role="alert">{erro}</p><button className="btn btn-primary" onClick={() => void carregar()}>Tentar novamente</button></main> :
      aba === 'catalogo' ? <Catalogo itens={itens} onMeus={() => setAba('meus')} onSolicitar={id => alterar(() => api<Emprestimo>('/emprestimos', { equipamentoId: id }), r => `Empréstimo registrado. Devolva até ${dataExibicao(r.devolver_ate)}.`)} /> :
      aba === 'meus' ? <MeusEmprestimos emprestimos={meus} onCatalogo={() => setAba('catalogo')} onDevolver={id => alterar(() => api(`/emprestimos/${id}/devolucao`, {}), 'Devolução registrada.')} /> :
      aba === 'operacoes' && operacoes ? <PainelOperacoes dados={operacoes} onCadastrar={() => setAba('equipamentos')} onDevolver={id => alterar(() => api(`/emprestimos/${id}/devolucao`, {}), 'Devolução registrada.')} /> :
      aba === 'equipamentos' && usuario.papel === 'operacoes' ? <CadastroEquipamento onCancelar={() => setAba('operacoes')} onNotify={notify} onSalvar={async (dados: Cadastro) => { await alterar(() => api('/equipamentos', dados), 'Equipamento cadastrado.'); setAba('operacoes') }} /> : null}
  </>
  return <>{conteudo}<Toast message={toast} /></>
}