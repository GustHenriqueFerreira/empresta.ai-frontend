import { useEffect, useState } from 'react'
import type { Equipamento } from '../../types'

export default function ImagemEquipamento({ item }: { item: Equipamento }) {
  const [falhou, setFalhou] = useState(false)
  useEffect(() => setFalhou(false), [item.imagem?.url])
  const foto = item.imagem
  return <div className="equipment-photo">
    <div className="equipment-photo-frame">
      {foto && !falhou ? <img src={foto.url} alt={`Imagem ilustrativa de referência para ${item.nome}`} width={800} height={600} loading="lazy" decoding="async" onError={() => setFalhou(true)} />
        : <div className="equipment-photo-empty" role="img" aria-label={`Imagem indisponível para ${item.nome}`}>Imagem indisponível</div>}
    </div>
    <div className="equipment-photo-caption"><span>Imagem ilustrativa</span>
      {foto && <a href={foto.pagina} target="_blank" rel="noopener noreferrer">{foto.autor} · Pixabay</a>}
    </div>
  </div>
}
