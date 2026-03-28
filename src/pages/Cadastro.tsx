import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { label: 'Empresa', to: '/cadastro/empresa' },
  { label: 'Produto', to: '/cadastro/produto' },
  { label: 'Segmento', to: '/cadastro/segmento' },
  { label: 'Usuário', to: '/cadastro/usuario' },
]

export default function Cadastro() {
  return (
    <div>
      <div
        style={{ borderBottom: '1px solid var(--color-border)', marginBottom: 24 }}
        className="flex gap-1"
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            style={({ isActive }) => ({
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
              borderBottom: isActive ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
              marginBottom: -1,
            })}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
