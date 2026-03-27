import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  PlusIcon,
  CircleStackIcon,
  Bars3Icon,
  CalendarDaysIcon,
  ChartBarIcon,
  GlobeAltIcon,
  Squares2X2Icon,
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
      className={`flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
        {!collapsed && (
          <span className="text-2xl font-bold text-[#2B2D6E]">Yeb</span>
        )}
        {collapsed && (
          <Squares2X2Icon className="w-6 h-6 text-[#2B2D6E] mx-auto" />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-[#2B2D6E] border-r-2 border-[#2B2D6E]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#2B2D6E]'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
