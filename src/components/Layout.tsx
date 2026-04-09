import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useTheme } from '../hooks/useTheme'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const { theme, toggle } = useTheme()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-page)' }}>
      <nav role="navigation" aria-label="Menu lateral">
        <Sidebar collapsed={collapsed} />
      </nav>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          onToggleSidebar={() => setCollapsed((c) => !c)}
          theme={theme}
          onToggleTheme={toggle}
        />
        <main id="main-content" className="flex-1 overflow-auto" style={{ padding: '18px 20px' }} aria-label="Conteúdo principal">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
