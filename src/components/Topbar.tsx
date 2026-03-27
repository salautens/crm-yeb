import { Button, SearchField, Select, ListBox } from '@heroui/react'
import {
  ArrowRightStartOnRectangleIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'

const filterOptions = [
  { id: 'empresa', label: 'Empresa' },
  { id: 'contato', label: 'Contato' },
  { id: 'oportunidade', label: 'Oportunidade' },
]

interface TopbarProps {
  onToggleSidebar: () => void
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  return (
    <header className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-200">
      {/* Collapse button */}
      <button
        onClick={onToggleSidebar}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
      >
        <Squares2X2Icon className="w-5 h-5" />
      </button>

      {/* Filter select */}
      <div className="w-44">
        <Select defaultSelectedKey="empresa" aria-label="Filtro">
          <Select.Trigger className="flex items-center justify-between w-full px-3 h-9 text-sm bg-white border border-gray-200 rounded-lg cursor-pointer">
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
          <SearchField.Group className="flex items-center h-9 px-3 bg-white border border-gray-200 rounded-lg">
            <SearchField.SearchIcon className="w-4 h-4 text-gray-400 mr-2" />
            <SearchField.Input
              placeholder="Pesquisar"
              className="flex-1 text-sm outline-none bg-transparent"
            />
          </SearchField.Group>
        </SearchField>
      </div>

      {/* Logout */}
      <Button variant="ghost" size="sm">
        <ArrowRightStartOnRectangleIcon className="w-4 h-4 mr-1.5" />
        Sair
      </Button>
    </header>
  )
}
