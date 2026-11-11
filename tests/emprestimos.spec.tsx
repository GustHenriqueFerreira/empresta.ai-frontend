import { renderToStaticMarkup } from 'react-dom/server'
import { MeusEmprestimos } from '../src/features/gestao/Gestao'
it('EM-CA-05 EM-CA-09: próprios empréstimos renderiza equipamento e datas do payload autorizado sem item de terceiro',()=>{
 const html=renderToStaticMarkup(<MeusEmprestimos emprestimos={[{id:'fixture-a',equipamento:{id:'item-a',nome:'Item de Pessoa A',categoria:'Cabo',patrimonio:'TI-A',situacao:'emprestado'},retirado_em:'2026-11-11T12:00:00Z',devolver_ate:'2026-11-25T00:00:00Z',emAtraso:false}]} onCatalogo={()=>{}} onDevolver={async()=>{}} />)
 expect(html).toContain('Item de Pessoa A');expect(html).toContain('TI-A')
 expect(html).toContain('11/11/2026');expect(html).toContain('25/11/2026')
 expect(html).not.toContain('Item de Pessoa B');expect(html).toContain('1 de 3 itens em seu nome')
})
