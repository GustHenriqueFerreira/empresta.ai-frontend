// Entrada exclusiva de teste local; o build de produção usa index.html/main.tsx.
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from '../src/App'
import ImagemEquipamento from '../src/features/catalogo/ImagemEquipamento'
import '../src/styles/tokens.css'
import '../src/styles/components.css'
const auth=import.meta.env.VITE_SUPABASE_URL
if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(auth))throw new Error('Harness só funciona em loopback')
async function controlar(acao:string){const r=await fetch(`${auth}/__fixture/${acao}`,{method:'POST'});if(!r.ok)throw new Error('Controle local falhou; cenário não aplicado.');window.location.reload()}
const foto={id:'fixture',nome:'Imagem de fixture',categoria:'Notebook',patrimonio:'FIXTURE',situacao:'disponivel' as const,
 imagem:{url:`${auth}/__fixture/foto.png`,autor:'Fixture',pagina:'https://pixabay.com/',fornecedor:'pixabay' as const,licenca:'https://pixabay.com/service/license-summary/',largura:800,altura:600,ilustrativa:true}}
function Controles(){
 const [persistencia,setPersistencia]=useState('Não consultada')
 return <aside aria-label="Controles do teste isolado" style={{display:'flex',gap:8,padding:8,flexWrap:'wrap'}}>
  <strong>Somente fixture local</strong>
  {['reset','falhar','normal','expirar','vazio','limite-demo','atraso-demo','lento','resposta-perdida'].map(a=><button key={a} onClick={()=>void controlar(a)}>{a}</button>)}
  <button onClick={()=>void fetch(`${auth}/__fixture/estado`).then(r=>r.json()).then(r=>setPersistencia(JSON.stringify(r)))}>Conferir persistência</button>
  <button onClick={()=>void fetch(`${auth}/__fixture/normal`,{method:'POST'}).then(r=>{if(!r.ok)throw Error('Falha no controle');setPersistencia('API restaurada')})}>Restaurar API sem recarregar</button>
  <output role="status" aria-label="Persistência da fixture">{persistencia}</output>
 </aside>
}
ReactDOM.createRoot(document.getElementById('root')!).render(<>
 <Controles />
 <App />
 <aside aria-label="Verificação de imagem isolada" style={{display:'flex',gap:16,padding:16}}>
  <div data-testid="foto-valida" style={{width:240}}><ImagemEquipamento item={foto}/></div>
  <div data-testid="foto-invalida" style={{width:240}}><ImagemEquipamento item={{...foto,imagem:{...foto.imagem,url:`${auth}/__fixture/nao-existe.png`}}}/></div>
 </aside>
</>)
