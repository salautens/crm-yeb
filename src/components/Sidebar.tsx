import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  PlusIcon,
  CircleStackIcon,
  Bars3Icon,
  CalendarDaysIcon,
  ChartBarIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'

const navItems = [
  { label: 'Início', icon: HomeIcon, to: '/' },
  { label: 'Cadastro', icon: PlusIcon, to: '/cadastro' },
  { label: 'Base de dados', icon: CircleStackIcon, to: '/base-dados' },
  { label: 'Pipeline', icon: Bars3Icon, to: '/pipeline' },
  { label: 'Eficiência', icon: CalendarDaysIcon, to: '/eficiencia' },
  { label: 'Indicadores', icon: ChartBarIcon, to: '/indicadores' },
  { label: 'Mapa de Guerra', icon: GlobeAltIcon, to: '/mapa-guerra' },
]

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-expanded)',
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-bg-white)',
        transition: 'width 0.3s ease',
      }}
      className="flex flex-col h-full shrink-0"
    >
      {/* Logo */}
      <div
        style={{
          height: 'var(--header-height)',
          borderBottom: '1px solid var(--color-border)',
        }}
        className="flex items-center px-4"
      >
        {collapsed ? (
          <span
            style={{ color: 'var(--color-brand-dark)', fontWeight: 700, fontSize: 20 }}
            className="mx-auto"
          >
            Y
          </span>
        ) : (
          <span style={{ color: 'var(--color-brand-dark)', fontWeight: 700, fontSize: 22 }}>
            Yeb
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '10px 0' : '10px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              position: 'relative',
              color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              background: isActive ? 'rgba(29,78,216,0.07)' : 'transparent',
              borderRight: isActive ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
            })}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
