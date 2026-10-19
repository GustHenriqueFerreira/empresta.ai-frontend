import { useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'

export interface ResumoLinha {
  rotulo: string
  valor: string
}

interface DialogProps {
  aberto: boolean
  titulo: string
  corpo?: string
  resumo?: ResumoLinha[]
  rotuloConfirmar: string
  onConfirmar: () => void
  onFechar: () => void
  ocupado?: boolean
}

/* Modal do design system — layout.md §5.6: 420px, backdrop sem animação, resumo com
   valor em destaque no acento. Clique fora fecha; clique dentro não fecha
   (só fecha quando o alvo do clique é o próprio backdrop). */
export default function Dialog({
  aberto,
  titulo,
  corpo,
  resumo,
  rotuloConfirmar,
  onConfirmar,
  onFechar,
  ocupado = false,
}: DialogProps) {
  const dialog = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!aberto) return
    const anterior = document.activeElement as HTMLElement | null
    dialog.current?.querySelector<HTMLElement>('button:not(:disabled)')?.focus()
    function teclado(e: KeyboardEvent) {
      if (e.key === 'Escape' && !ocupado) onFechar()
      if (e.key !== 'Tab') return
      const botoes = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled)') || [])
      if (!botoes.length) { e.preventDefault(); return }
      const primeiro = botoes[0], ultimo = botoes[botoes.length - 1]
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus() }
      if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus() }
    }
    document.addEventListener('keydown', teclado)
    return () => { document.removeEventListener('keydown', teclado); anterior?.focus() }
  }, [aberto, ocupado, onFechar])
  if (!aberto) return null

  function aoClicarFora(evento: MouseEvent<HTMLDivElement>) {
    if (!ocupado && evento.target === evento.currentTarget) onFechar()
  }

  return (
    <div className="backdrop" onClick={aoClicarFora}>
      <div ref={dialog} className="dialog" role="dialog" aria-modal="true" aria-busy={ocupado} aria-labelledby="dialog-title">
        <h2 className="dialog-title" id="dialog-title">
          {titulo}
        </h2>
        {corpo && <p className="dialog-body">{corpo}</p>}
        {resumo && resumo.length > 0 && (
          <div className="summary">
            {resumo.map((linha) => (
              <div className="summary-row" key={linha.rotulo}>
                <span className="k">{linha.rotulo}</span>
                <span className="v">{linha.valor}</span>
              </div>
            ))}
          </div>
        )}
        <div className="dialog-actions">
          <button type="button" disabled={ocupado} className="btn btn-secondary" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" disabled={ocupado} className="btn btn-primary" onClick={onConfirmar}>
            {ocupado ? 'Salvando…' : rotuloConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
