import { prazoPadrao,dataExibicao } from '../src/utils/datas'
it.each([
 ['2026-10-20T01:00:00Z','02/11/2026'],
 ['2026-10-20T03:00:00Z','03/11/2026'],
 ['2026-11-06T15:00:00Z','20/11/2026'],
 ['2026-12-25T15:00:00Z','08/01/2027'],
 ['2028-02-20T15:00:00Z','05/03/2028'],
])('EM-CA-05 CA-07: 14 dias corridos/Brasília em %s resulta em %s',(entrada,esperada)=>{
 expect(prazoPadrao(new Date(entrada))).toBe(esperada)
})
it('EM-CA-05: data persistida é exibida DD/MM/AAAA sem deslocar por timezone',()=>{
 expect(dataExibicao('2026-11-20T00:00:00.000Z')).toBe('20/11/2026')
 expect(dataExibicao()).toBe('—')
})
