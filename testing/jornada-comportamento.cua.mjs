// Teste automatizado pelo principal via CUA. Só usa a API de browser documentada.
// Recebe a aba do harness isolado; nunca navega para produção ou lê sessão/token.
export async function executarJornada(tab){
 if(!/^http:\/\/127\.0\.0\.1:\d+\/testing\/index\.html$/.test(await tab.url()))throw Error('Jornada exige harness loopback')
 const prova={executor:'principal via CUA; asserções automatizadas, não Jest',inicio:new Date().toISOString(),producao:false,casos:[]}
 const assert=(v,m)=>{if(!v)throw Error(m)}
 const botao=n=>tab.playwright.getByRole('button',{name:n,exact:true})
 const texto=n=>tab.playwright.getByText(n,{exact:true})
 const snapshot=()=>tab.playwright.domSnapshot()
 // O provedor pode limitar cada espera individual; o prazo total continua explícito.
 const esperar=async(alvo,tempo=15000)=>{
  const fim=Date.now()+tempo;let ultimo
  do{try{await alvo.waitFor({state:'visible',timeoutMs:Math.min(2000,Math.max(1,fim-Date.now()))});return}catch(e){if(!/deadline exceeded|timed out/.test(e.message))throw e;ultimo=e;await snapshot()}}while(Date.now()<fim)
  throw ultimo
 }
 const caso=async(nome,fn)=>{try{await fn();prova.casos.push({nome,passou:true})}catch(e){prova.casos.push({nome,passou:false,erro:e.message});throw Object.assign(Error(nome+': '+e.message),{prova})}}
 const controlar=async n=>{await botao(n).click();await snapshot()}
 const entrar=async(email='pessoa.a@example.invalid',senha='fixture-local',esperar=true)=>{
  await tab.playwright.getByRole('textbox',{name:'E-mail',exact:true}).fill(email)
  await tab.playwright.getByRole('textbox',{name:'Senha',exact:true}).fill(senha)
  await botao('Entrar').click();await snapshot()
  if(esperar)await aguardarCatalogo()
 }
 const aguardarCatalogo=()=>esperar(tab.playwright.getByRole('heading',{name:'Catálogo',exact:true}))
 const persistencia=async()=>{await botao('Conferir persistência').click();await snapshot();return JSON.parse(await tab.playwright.getByRole('status',{name:'Persistência da fixture',exact:true}).innerText())}
 const confirmar=()=>tab.playwright.getByRole('dialog').getByRole('button',{name:'Solicitar',exact:true})
 await caso('EM-CA-10: foto válida carrega e onError apresenta estado indisponível',async()=>{
  const boa=await tab.playwright.getByTestId('foto-valida').getByRole('img').evaluate(e=>({w:e.naturalWidth,h:e.naturalHeight}))
  assert(boa.w===800&&boa.h===600,'Imagem válida não carregou')
  await tab.playwright.getByTestId('foto-invalida').getByRole('img',{name:'Imagem indisponível para Imagem de fixture',exact:true}).waitFor({state:'visible'})
 })
 await caso('EM-CA-10: senha incorreta mostra erro sem entrar',async()=>{await entrar('pessoa.a@example.invalid','incorreta',false);await texto('E-mail ou senha inválidos.').waitFor({state:'visible'});assert(await botao('Entrar').isVisible(),'Login não preservado')})
 await controlar('lento')
 await caso('EM-CA-10: login e GET lentos mostram carregamento e recuperam catálogo',async()=>{await entrar(undefined,undefined,false);await esperar(texto('Carregando…'),8000);await aguardarCatalogo()})
 await caso('EM-CA-10: modal mantém foco e duplo clique envia uma única solicitação',async()=>{
  await botao('Solicitar').first().click();await snapshot()
  await tab.playwright.getByRole('dialog').getByRole('button',{name:'Cancelar',exact:true}).press('Shift+Tab')
  assert(await tab.playwright.evaluate(()=>!!document.activeElement?.closest('[role="dialog"]')),'Foco saiu do modal')
  await confirmar().dblclick();await snapshot()
  await botao('Salvando…').waitFor({state:'visible',timeoutMs:1500})
  assert(await tab.playwright.getByRole('dialog').getAttribute('aria-busy')==='true','Modal não ocupado')
  assert(!await tab.playwright.getByRole('dialog').getByRole('button',{name:'Cancelar',exact:true}).isEnabled(),'Cancelar habilitado durante envio')
  await esperar(botao('Está com você'))
  const p=await persistencia();assert(p.total===1&&p.abertos===1,'Duplo envio criou quantidade inesperada')
 })
 await caso('EM-CA-05 EM-CA-09: própria lista renderiza equipamento e data recebida',async()=>{
  await botao('Meus empréstimos').click();await snapshot()
  const linhas=await tab.playwright.getByRole('article').allTextContents()
  assert(linhas.length===1&&linhas[0].includes('TI-0001')&&/\d{2}\/\d{2}\/\d{4}/.test(linhas[0]),'Lista própria divergente')
 })
 await caso('EM-CA-09: outra identidade não renderiza empréstimo da primeira',async()=>{await botao('Sair').click();await botao('Entrar').waitFor({state:'visible'});await entrar('pessoa.b@example.invalid');await botao('Meus empréstimos').click();await snapshot();assert(await texto('Você não tem empréstimos em aberto.').isVisible(),'Pessoa B recebeu empréstimo de A')})
 await controlar('reset');await controlar('resposta-perdida')
 await caso('EM-CA-03 EM-CA-10: resposta perdida após gravação reconcilia GET sem repetir POST',async()=>{
  await aguardarCatalogo()
  await botao('Solicitar').first().click();await confirmar().click();await snapshot()
  await esperar(botao('Está com você'),30000)
  assert(await tab.playwright.getByRole('dialog').count()===0,'Confirmação antiga permaneceu aberta')
  const p=await persistencia();assert(p.total===1&&p.abertos===1,'Reconciliação repetiu ou perdeu gravação')
  await botao('Meus empréstimos').click();await snapshot();assert(await tab.playwright.getByRole('article').count()===1,'Lista não reconciliada')
 })
 await controlar('falhar')
 await caso('EM-CA-10: erro de GET permite recuperação por Tentar novamente sem novo POST',async()=>{
  await texto('Falha local de teste. Tente novamente.').waitFor({state:'visible'})
  await botao('Restaurar API sem recarregar').click();await texto('API restaurada').waitFor({state:'visible'})
  await botao('Tentar novamente').click();await aguardarCatalogo()
  const p=await persistencia();assert(p.total===1,'Recuperação criou empréstimo')
 })
 await controlar('vazio')
 await caso('EM-CA-10: catálogo vazio não inventa equipamentos',async()=>{await texto('Nenhum equipamento cadastrado.').waitFor({state:'visible'});assert(await tab.playwright.getByRole('article').count()===0,'Cartão fictício')})
 await controlar('reset');await controlar('expirar')
 await caso('EM-CA-10: sessão expirada retorna ao login e remove dados anteriores',async()=>{await botao('Entrar').waitFor({state:'visible',timeoutMs:15000});assert(await tab.playwright.getByRole('heading',{name:'Catálogo',exact:true}).count()===0,'Catálogo permaneceu após expiração')})
 prova.fim=new Date().toISOString();prova.sucesso=true;return prova
}
