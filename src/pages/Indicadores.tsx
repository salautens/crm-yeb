import { useState } from 'react'
import ComunicacaoTab from './indicadores/ComunicacaoTab'
import VendasTab from './indicadores/VendasTab'
import GestaoTab from './indicadores/GestaoTab'

const TABS = ['Comunicação', 'Vendas', 'Gestão']

export default function Indicadores() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Indicadores</h1>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: 24 }} className="flex gap-1">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '8px 20px',
              fontSize: 14,
              fontWeight: 500,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === i ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
              borderBottom: activeTab === i ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && <ComunicacaoTab />}
      {activeTab === 1 && <VendasTab />}
      {activeTab === 2 && <GestaoTab />}
    </div>
  )
}
