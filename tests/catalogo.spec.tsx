import { renderToStaticMarkup } from 'react-dom/server'
import Catalogo from '../src/features/catalogo/Catalogo'
import type { Equipamento, Emprestimo } from '../src/types'
const base:Equipamento={id:'fixture',nome:'Notebook de referência',categoria:'Notebook',patrimonio:'TI-0001',situacao:'disponivel',
  imagem:{url:'https://abcdefghijklmnopqrst.supabase.co/storage/v1/object/public/equipamentos-pratica/foto.png',autor:'Autor fixture',pagina:'https://pixabay.com/photos/fixture-1/',fornecedor:'pixabay',licenca:'https://pixabay.com/service/license-summary/',largura:800,altura:600,ilustrativa:true}}
const render=(itens:Equipamento[],emprestimos:Emprestimo[]=itens.filter(e=>e.comigo).map((e,i)=>({id:`emprestimo-${i}`,equipamento:e,retirado_em:'2026-11-01',devolver_ate:'2026-11-15',emAtraso:!!e.emAtraso})))=>renderToStaticMarkup(<Catalogo itens={itens} emprestimos={emprestimos} onSolicitar={async()=>{}} onMeus={()=>{}} />)
it('EM-CA-01 EM-CA-02: renderiza patrimônio, foto 4:3, texto alternativo e crédito rastreável',()=>{
  const html=render([base])
  expect(html).toContain('TI-0001');expect(html).toContain(base.imagem!.url)
  expect(html).toContain('width="800" height="600"');expect(html).toContain('alt="Imagem ilustrativa de referência para Notebook de referência"')
  expect(html).toContain('href="https://pixabay.com/"');expect(html).toContain(base.imagem!.pagina)
  expect(html).toContain('Autor fixture');expect(html).toContain('Imagem ilustrativa')
})
it('EM-CA-07 EM-CA-10: manutenção fica identificada, sem ação de solicitar e sem foto fictícia',()=>{
  const html=render([{...base,situacao:'manutencao',imagem:null}])
  expect(html).toContain('Em manutenção');expect(html).toContain('disabled=""')
  expect(html).not.toContain('>Solicitar</button>');expect(html).not.toContain('<img')
  expect(html).toContain('Imagem indisponível')
})
it('EM-CA-04 EM-CA-06: limite e atraso geram bloqueios visíveis em itens disponíveis',()=>{
  const meus=[0,1,2].map(i=>({...base,id:`meu-${i}`,situacao:'emprestado' as const,comigo:true}))
  expect(render([...meus,base])).toContain('Limite de 3 itens')
  const atrasado={...meus[0],emAtraso:true}
  expect(render([atrasado,base])).toContain('Bloqueado por atraso')
  expect(render([atrasado,base])).toContain('Ver meus empréstimos')
})
it('EM-CA-10: catálogo vazio oferece estado explícito sem cartões inventados',()=>{
  expect(render([])).toContain('Nenhum equipamento cadastrado.')
  expect(render([])).not.toContain('<article')
})
it('EM-CA-04 EM-CA-06 EM-CA-10: empréstimos DEMO fora do catálogo continuam bloqueando limite e atraso',()=>{
  const historicos:Emprestimo[]=[0,1,2].map(i=>({id:`historico-${i}`,equipamento:{...base,id:`demo-${i}`,patrimonio:`DEMO-${i}`,imagem:null},retirado_em:'2026-11-01',devolver_ate:'2026-11-15',emAtraso:false}))
  const limite=render([base],historicos)
  expect(limite).toContain('Limite de 3 itens');expect(limite).not.toContain('>Solicitar</button>')
  const atraso=render([base],[{...historicos[0],emAtraso:true}])
  expect(atraso).toContain('Bloqueado por atraso');expect(atraso).toContain('Ver meus empréstimos')
  expect(atraso).not.toContain('>Solicitar</button>')
})
