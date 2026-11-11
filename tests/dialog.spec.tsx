import { renderToStaticMarkup } from 'react-dom/server'
import Dialog from '../src/components/Dialog'
it('EM-CA-10: modal ocupado conserva alvo de foco e bloqueia as duas ações',()=>{
 const html=renderToStaticMarkup(<Dialog aberto ocupado titulo="Solicitar empréstimo" rotuloConfirmar="Solicitar" onConfirmar={()=>{}} onFechar={()=>{}} />)
 expect(html).toContain('role="dialog"');expect(html).toContain('tabindex="-1"')
 expect(html).toContain('aria-busy="true"');expect(html.match(/disabled=""/g)).toHaveLength(2)
 expect(html).toContain('Salvando…')
})
