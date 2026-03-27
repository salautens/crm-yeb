import { Button, SearchField, Select, ListBox } from '@heroui/react'
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline'

const filterOptions = [
  { id: 'empresa', label: 'Empresa' },
  { id: 'contato', label: 'Contato' },
  { id: 'oportunidade', label: 'Oportunidade' },
]

interface TopbarProps {
  onToggleSidebar: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Topbar({ onToggleSidebar, theme, onToggleTheme }: TopbarProps) {
  return (
    <header
      style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-white)',
      }}
      className="flex items-center gap-3 px-6 shrink-0"
    >
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        style={{ color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)' }}
        className="p-1.5 hover:opacity-70"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      {/* Filter select */}
      <div className="w-44">
        <Select defaultSelectedKey="empresa" aria-label="Filtro">
          <Select.Trigger
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-white)',
              color: 'var(--color-text-primary)',
              fontSize: 14,
              height: 36,
              padding: '0 12px',
            }}
            className="flex items-center justify-between w-full cursor-pointer"
          >
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {filterOptions.map((opt) => (
                <ListBox.Item key={opt.id} id={opt.id}>
                  {opt.label}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* Search */}
      <div className="flex-1">
        <SearchField aria-label="Pesquisar">
          <SearchField.Group
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-white)',
              height: 36,
              padding: '0 12px',
            }}
            className="flex items-center gap-2"
          >
            <SearchField.SearchIcon
              style={{ color: 'var(--color-text-muted)', width: 16, height: 16 }}
            />
            <SearchField.Input
              placeholder="Pesquisar"
              style={{
                flex: 1,
                fontSize: 14,
                outline: 'none',
                background: 'transparent',
                color: 'var(--color-text-primary)',
              }}
            />
          </SearchField.Group>
        </SearchField>
      </div>

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        style={{
          color: 'var(--color-text-muted)',
          borderRadius: 'var(--radius-md)',
          padding: '6px',
          background: 'transparent',
          border: '1px solid var(--color-border)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
        title={theme === 'dark' ? 'Mudar para Light' : 'Mudar para Dark'}
      >
        {theme === 'dark' ? (
          <SunIcon className="w-4 h-4" />
        ) : (
          <MoonIcon className="w-4 h-4" />
        )}
      </button>

      {/* Logout */}
      <Button variant="ghost" size="sm" style={{ color: 'var(--color-text-secondary)' }}>
        <ArrowRightStartOnRectangleIcon className="w-4 h-4 mr-1.5" />
        Sair
      </Button>
    </header>
  )
}
