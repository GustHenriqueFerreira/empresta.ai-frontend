import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Cadastro, Emprestimo, Operacoes } from '../../types'
import Dialog from '../../components/Dialog'
import { dataExibicao } from '../../utils/datas'

function Situacao({ item }: { item: Emprestimo }) {
  return <span className={`pill ${item.emAtraso ? 'pill-atraso' : 'pill-disponivel'}`}>{item.emAtraso ? 'Em atraso' : 'Em dia'}</span>
}

function Devolucao({ item, operacoes = false, onFechar, onDevolver }: { item: Emprestimo | null; operacoes?: boolean; onFechar: () => void; onDevolver: (id: string) => Promise<void> }) {
  const [enviando, setEnviando] = useState(false)
  async function confirmar() {
    if (!item || enviando) return
    setEnviando(true)
    try { await onDevolver(item.id); onFechar() }
    catch { /* Erro informado pelo app; preserva confirmação para tentar novamente. */ }
    finally { setEnviando(false) }
  }
  const hoje = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  return <Dialog aberto={!!item} ocupado={enviando} titulo={operacoes ? 'Registrar devolução' : 'Devolver equipamento'} corpo="O equipamento voltará a ficar disponível no catálogo." resumo={item ? [{ rotulo: 'Equipamento', valor: item.equipamento.nome }, { rotulo: operacoes ? 'Pessoa' : 'Devolução em', valor: operacoes ? item.usuario?.nome || '—' : hoje }] : []} rotuloConfirmar={operacoes ? 'Registrar devolução' : 'Devolver'} onConfirmar={() => void confirmar()} onFechar={onFechar} />
}

export function MeusEmprestimos({ emprestimos, onCatalogo, onDevolver }: { emprestimos: Emprestimo[]; onCatalogo: () => void; onDevolver: (id: string) => Promise<void> }) {
  const [pendente, setPendente] = useState<Emprestimo | null>(null)
  return <main className="page page-body">
    <div className="head-left"><h1>Meus empréstimos</h1><p className="lead">{emprestimos.length} de 3 itens em seu nome · prazo padrão de 14 dias</p></div>
    <div className="slots" aria-label={`${emprestimos.length} de 3 itens ocupados`}>{[0, 1, 2].map(n => <span key={n} className={emprestimos[n] ? emprestimos[n].emAtraso ? 'slot atraso' : 'slot ocupado' : 'slot'} />)}</div>
    {emprestimos.length ? <section className="loan-list">{emprestimos.map(item => <article className={`loan-row ${item.emAtraso ? 'atraso' : ''}`} key={item.id}>
      <div className="loan-item"><strong>{item.equipamento.nome}</strong><span className="muted">{item.equipamento.patrimonio}</span></div>
      <div><span className="kicker">Retirada</span><div>{dataExibicao(item.retirado_em)}</div></div>
      <div><span className="kicker">Devolver até</span><div className={item.emAtraso ? 'text-danger' : 'text-accent'}>{dataExibicao(item.devolver_ate)}</div></div>
      <Situacao item={item} /><button className="btn btn-primary" onClick={() => setPendente(item)}>Devolver</button>
    </article>)}</section> : <div className="empty empty-stack"><span>Você não tem empréstimos em aberto.</span><button className="btn btn-primary" onClick={onCatalogo}>Ir ao catálogo</button></div>}
    <div className="rules-foot"><span>Até 3 itens por pessoa.</span><span>Prazo padrão de 14 dias.</span><span>Itens em atraso bloqueiam novas solicitações.</span></div>
    <Devolucao item={pendente} onFechar={() => setPendente(null)} onDevolver={onDevolver} />
  </main>
}

export function PainelOperacoes({ dados, onCadastrar, onDevolver }: { dados: Operacoes; onCadastrar: () => void; onDevolver: (id: string) => Promise<void> }) {
  const [busca, setBusca] = useState('')
  const [pendente, setPendente] = useState<Emprestimo | null>(null)
  const termo = busca.trim().toLowerCase()
  const visiveis = dados.emprestimos.filter(e => `${e.usuario?.nome} ${e.equipamento.nome}`.toLowerCase().includes(termo))
  const indicadores = [['Em aberto', dados.indicadores.abertos, 'Equipamentos em uso'], ['Em atraso', dados.indicadores.atrasados, 'Prazo de devolução vencido'], ['Disponíveis', dados.indicadores.disponiveis, 'Prontos para retirada'], ['Manutenção', dados.indicadores.manutencao, 'Fora de circulação']] as const
  return <main className="page page-body">
    <div className="page-head"><div className="head-left"><h1>Operações</h1><p className="lead">Empréstimos em aberto e situação dos equipamentos.</p></div><div className="actions"><input className="input ops-search" aria-label="Buscar por pessoa ou equipamento" placeholder="Buscar pessoa ou equipamento" value={busca} onChange={e => setBusca(e.target.value)} /><button className="btn btn-primary" onClick={onCadastrar}>Cadastrar equipamento</button></div></div>
    <section className="kpis">{indicadores.map(([titulo, valor, dica], n) => <div className="kpi" key={titulo}><span className="kicker">{titulo}</span><strong className={n === 1 ? 'text-danger' : n === 2 ? 'text-accent' : ''}>{valor}</strong><span className="muted">{dica}</span></div>)}</section>
    <div className="table-wrap"><table className="table"><thead><tr>{['Pessoa', 'Equipamento', 'Patrimônio', 'Retirada', 'Prazo', 'Situação', 'Ação'].map(t => <th key={t} scope="col">{t}</th>)}</tr></thead><tbody>{visiveis.length ? visiveis.map(e => <tr key={e.id}><td><span className="person"><span className="avatar" aria-hidden="true">{e.usuario?.nome.split(/\s+/).slice(0, 2).map(n => n[0]).join('')}</span>{e.usuario?.nome}</span></td><td>{e.equipamento.nome}</td><td className="muted">{e.equipamento.patrimonio}</td><td>{dataExibicao(e.retirado_em)}</td><td className={e.emAtraso ? 'text-danger' : 'text-accent'}>{dataExibicao(e.devolver_ate)}</td><td><Situacao item={e} /></td><td><button className="btn btn-secondary" onClick={() => setPendente(e)}>Registrar devolução</button></td></tr>) : <tr><td colSpan={7} className="table-empty">{termo ? 'Nenhum empréstimo encontrado para a busca atual.' : 'Nenhum empréstimo em aberto.'}</td></tr>}</tbody></table></div>
    <Devolucao item={pendente} operacoes onFechar={() => setPendente(null)} onDevolver={onDevolver} />
  </main>
}

export function CadastroEquipamento({ onSalvar, onCancelar, onNotify }: { onSalvar: (dados: Cadastro) => Promise<void>; onCancelar: () => void; onNotify: (texto: string) => void }) {
  const [dados, setDados] = useState<Cadastro>({ nome: '', categoria: 'Notebook', patrimonio: '', observacoes: '', situacao: 'disponivel' })
  const [enviando, setEnviando] = useState(false)
  function campo(chave: keyof Cadastro, valor: string) { setDados(atual => ({ ...atual, [chave]: valor })) }
  async function salvar(e: FormEvent) {
    e.preventDefault()
    if (enviando) return
    if (!dados.nome.trim()) { onNotify('Informe o nome do equipamento'); return }
    setEnviando(true)
    try { await onSalvar({ ...dados, nome: dados.nome.trim(), patrimonio: dados.patrimonio.trim() || 'TI-—' }) }
    catch { /* Mantém formulário e campos no erro. */ }
    finally { setEnviando(false) }
  }
  return <main className="page page-body"><div className="head-left"><h1>Equipamentos</h1><p className="lead">Cadastre um equipamento no catálogo.</p></div><div className="cadastro-layout">
    <form className="form-card" onSubmit={e => void salvar(e)} noValidate aria-busy={enviando}>
      <div className="field span-two"><label htmlFor="equip-nome">Nome</label><input id="equip-nome" className="input" maxLength={200} required value={dados.nome} onChange={e => campo('nome', e.target.value)} /></div>
      <div className="field"><label htmlFor="equip-categoria">Categoria</label><select id="equip-categoria" className="input" value={dados.categoria} onChange={e => campo('categoria', e.target.value)}>{['Notebook', 'Monitor', 'Cabo', 'Câmera', 'Acessório'].map(c => <option key={c}>{c}</option>)}</select></div>
      <div className="field"><label htmlFor="equip-patrimonio">Patrimônio</label><input id="equip-patrimonio" className="input" maxLength={100} placeholder="TI-—" value={dados.patrimonio} onChange={e => campo('patrimonio', e.target.value)} /></div>
      <div className="field span-two"><label htmlFor="equip-observacoes">Observações</label><textarea id="equip-observacoes" className="input" maxLength={2000} value={dados.observacoes} onChange={e => campo('observacoes', e.target.value)} /></div>
      <fieldset className="span-two radio-group"><legend>Situação inicial</legend>{(['disponivel', 'manutencao'] as const).map(s => <label className="radio" key={s}><input type="radio" name="situacao" value={s} checked={dados.situacao === s} onChange={() => campo('situacao', s)} />{s === 'disponivel' ? 'Disponível' : 'Em manutenção'}</label>)}</fieldset>
      <div className="actions form-footer span-two"><button className="btn btn-primary" disabled={enviando} type="submit">{enviando ? 'Salvando…' : 'Cadastrar equipamento'}</button><button className="btn btn-ghost" disabled={enviando} type="button" onClick={onCancelar}>Cancelar</button></div>
    </form>
    <aside className="side-panels"><section className="side-panel"><h2>Regras em vigor</h2><ul><li>Até 3 itens por pessoa.</li><li>Prazo de devolução de 14 dias.</li><li>Atraso bloqueia novos empréstimos.</li><li>Manutenção impede solicitação.</li></ul></section><section className="side-panel muted"><h2>Fora desta versão</h2><ul><li>Reserva com data futura</li><li>Notificação por e-mail</li><li>Importação da planilha</li></ul></section></aside>
  </div></main>
}
