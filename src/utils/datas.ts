/* Datas — layout.md §7: "Devolver até" = hoje + 14 dias, em DD/MM/AAAA. */

export const PRAZO_PADRAO_DIAS = 14

export function dataExibicao(valor?: string): string {
  if (!valor) return '—'
  const [ano, mes, dia] = valor.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatarData(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}/${data.getFullYear()}`
}

export function prazoPadrao(hoje: Date = new Date()): string {
  const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(hoje)
  const prazo = new Date(`${dia}T12:00:00Z`)
  prazo.setUTCDate(prazo.getUTCDate() + PRAZO_PADRAO_DIAS)
  return dataExibicao(prazo.toISOString())
}
