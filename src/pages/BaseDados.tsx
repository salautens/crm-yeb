import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, useOverlayState } from '@heroui/react'
import { empresas } from '../data/empresas'
import { segmentos } from '../data/segmentos'
import { usuarios } from '../data/usuarios'
import { profissionais } from '../data/profissionais'
import { contratos } from '../data/contratos'
import { produtos } from '../data/produtos'
import { usePagination } from '../hooks/usePagination'
import { TablePagination, EmpresaAlvoBadge } from '../components/ui'
import { Badge } from '../components/ui/Badge'
import type { PipelineStage, FiltroSalvo, StatusRelacionamento } from '../types'

const pipelineMap: Record<PipelineStage, { label: string; variant: 'neutral' | 'brand' | 'pending' | 'active' | 'danger' | 'inactive' }> = {
  prospeccao:        { label: 'Prospecção',       variant: 'neutral'   },
  qualificacao:      { label: 'Qualificação',      variant: 'brand'     },
  proposta_enviada:  { label: 'Proposta Enviada',  variant: 'pending'   },
  em_negociacao:     { label: 'Em Negociação',     variant: 'pending'   },
  proposta_aceita:   { label: 'Proposta Aceita',   variant: 'active'    },
  proposta_recusada: { label: 'Proposta Recusada', variant: 'danger'    },
  fechado:           { label: 'Fechado',           variant: 'inactive'  },
}

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const statusRelMap: Record<StatusRelacionamento, { label: string; color: string }> = {
  lead:          { label: 'Lead',          color: '#94A3B8' },
  prospect:      { label: 'Prospect',      color: '#3B82F6' },
  cliente_ativo: { label: 'Cliente Ativo', color: '#10B981' },
  ex_cliente:    { label: 'Ex-Cliente',    color: '#F59E0B' },
  parceiro:      { label: 'Parceiro',      color: '#8B5CF6' },
  nao_definido:  { label: 'Não Definido',  color: '#94A3B8' },
}

const COLUNAS = [
  { grupo: 'Empresa', id: 'razaoSocial',    label: 'Razão Social',             default: true  },
  { grupo: 'Empresa', id: 'nomeFantasia',   label: 'Nome Fantasia',             default: true  },
  { grupo: 'Empresa', id: 'cnpj',           label: 'CNPJ',                      default: true  },
  { grupo: 'Empresa', id: 'segmento',       label: 'Segmento',                  default: true  },
  { grupo: 'Empresa', id: 'cidade',         label: 'Cidade',                    default: false },
  { grupo: 'Empresa', id: 'uf',             label: 'UF',                        default: true  },
  { grupo: 'Empresa', id: 'pipeline',       label: 'Pipeline',                  default: true  },
  { grupo: 'Empresa', id: 'relacionamento', label: 'Status de Relacionamento',  default: true  },
  { grupo: 'Empresa', id: 'alvo',           label: 'Empresa Alvo',              default: false },
  { grupo: 'Empresa', id: 'responsavel',    label: 'Responsável',               default: true  },
  { grupo: 'Contato', id: 'cNome',          label: 'Nome do Contato',           default: false },
  { grupo: 'Contato', id: 'cCargo',         label: 'Cargo',                     default: false },
  { grupo: 'Contato', id: 'cEmail',         label: 'E-mail',                    default: true  },
  { grupo: 'Contato', id: 'cTelefone',      label: 'Telefone',                  default: true  },
] as const

type ColId = typeof COLUNAS[number]['id']

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  fontSize: 13,
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-bg-white)',
  color: 'var(--color-text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function BaseDados() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterSegmento, setFilterSegmento] = useState('')
  const [filterPipeline, setFilterPipeline] = useState('')
  const [filterAlvo, setFilterAlvo] = useState('')
  const [filterUF, setFilterUF] = useState('')
  const [filterUsuario, setFilterUsuario] = useState('')
  const [filterStatusRel, setFilterStatusRel] = useState('')
  const [filterProduto, setFilterProduto] = useState('')
  const [filtrosSalvos, setFiltrosSalvos] = useState<FiltroSalvo[]>([
    { id: 1, nome: 'Empresas Alvo Ativas' },
    { id: 2, nome: 'Usinas SP' },
  ])
  const [nomeFiltro, setNomeFiltro] = useState('')
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())
  const [modalExport, setModalExport] = useState(false)
  const [exportarSelecionadas, setExportarSelecionadas] = useState(false)
  const [colunasAtivas, setColunasAtivas] = useState<Set<ColId>>(
    new Set(COLUNAS.filter((c) => c.default).map((c) => c.id))
  )
  const [nomeArquivo, setNomeArquivo] = useState('base-yeb')
  const saveState = useOverlayState()

  // mapa empresaId → Set de produtoIds (a partir dos contratos)
  const produtosPorEmpresa = useMemo(() => {
    const m = new Map<number, Set<number>>()
    contratos.forEach((c) => {
      if (!m.has(c.empresaId)) m.set(c.empresaId, new Set())
      c.produtos.forEach((pid) => m.get(c.empresaId)!.add(pid))
    })
    return m
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return empresas.filter((e) => {
      const matchSearch = !q || e.razaoSocial.toLowerCase().includes(q) || e.nomeFantasia.toLowerCase().includes(q) || e.cnpj.includes(q)
      const matchSeg = !filterSegmento
        ? true
        : filterSegmento === 'none'
          ? !e.segmentoId
          : e.segmentoId === Number(filterSegmento)
      const matchPipe = !filterPipeline || e.pipeline === filterPipeline
      const matchAlvo = filterAlvo === '' ? true : filterAlvo === 'sim' ? e.empresaAlvo : !e.empresaAlvo
      const matchUF = !filterUF || e.uf === filterUF
      const matchUser = !filterUsuario || e.usuarioId === Number(filterUsuario)
      const matchStatusRel = !filterStatusRel || e.statusRelacionamento === filterStatusRel
      const matchProduto = !filterProduto || produtosPorEmpresa.get(e.id)?.has(Number(filterProduto)) === true
      return matchSearch && matchSeg && matchPipe && matchAlvo && matchUF && matchUser && matchStatusRel && matchProduto
    })
  }, [search, filterSegmento, filterPipeline, filterAlvo, filterUF, filterUsuario, filterStatusRel, filterProduto, produtosPorEmpresa])

  const { page, setPage, totalPages, paginated } = usePagination(filtered, 12)

  const hasFilters = !!(search || filterSegmento || filterPipeline || filterAlvo || filterUF || filterUsuario || filterStatusRel || filterProduto)

  const handleReset = () => {
    setSearch(''); setFilterSegmento(''); setFilterPipeline('')
    setFilterAlvo(''); setFilterUF(''); setFilterUsuario(''); setFilterStatusRel(''); setFilterProduto('')
    setSelecionados(new Set())
  }

  const toggleSelecionado = (id: number) => {
    setSelecionados((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const todaAPaginaSelecionada = paginated.length > 0 && paginated.every((e) => selecionados.has(e.id))
  const algunsDaPaginaSelecionados = paginated.some((e) => selecionados.has(e.id)) && !todaAPaginaSelecionada

  const togglePagina = () => {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (todaAPaginaSelecionada) {
        paginated.forEach((e) => next.delete(e.id))
      } else {
        paginated.forEach((e) => next.add(e.id))
      }
      return next
    })
  }

  const limparSelecao = () => setSelecionados(new Set())

  const handleSaveFiltro = () => {
    if (!nomeFiltro.trim()) return
    setFiltrosSalvos((prev) => [...prev, { id: Date.now(), nome: nomeFiltro }])
    setNomeFiltro('')
    saveState.close()
  }

  const abrirModalExport = (apenasSel: boolean) => {
    setExportarSelecionadas(apenasSel)
    setModalExport(true)
  }

  const handleExport = () => {
    const lista = exportarSelecionadas && selecionados.size > 0
      ? filtered.filter((e) => selecionados.has(e.id))
      : filtered
    const cols = COLUNAS.filter((c) => colunasAtivas.has(c.id))
    const headers = cols.map((c) => c.label)
    const rows = lista.map((e) => {
      const contato = profissionais.find((p) => p.empresaId === e.id && p.status === 'ativo')
      const val: Record<ColId, string> = {
        razaoSocial:    e.razaoSocial,
        nomeFantasia:   e.nomeFantasia,
        cnpj:           e.cnpj,
        segmento:       segmentos.find((s) => s.id === e.segmentoId)?.nome ?? '',
        cidade:         e.cidade ?? '',
        uf:             e.uf ?? '',
        pipeline:       pipelineMap[e.pipeline].label,
        relacionamento: statusRelMap[e.statusRelacionamento]?.label ?? '',
        alvo:           e.empresaAlvo ? 'Sim' : 'Não',
        responsavel:    usuarios.find((u) => u.id === e.usuarioId)?.nome ?? '',
        cNome:          contato?.nome ?? '',
        cCargo:         contato?.cargo ?? '',
        cEmail:         contato?.email ?? '',
        cTelefone:      contato?.telefone ?? '',
      }
      return cols.map((c) => val[c.id])
    })
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const sufixo = exportarSelecionadas && selecionados.size > 0 ? `_${selecionados.size}-sel` : `_${lista.length}-emp`
    a.href = url; a.download = `${nomeArquivo || 'base-yeb'}${sufixo}.csv`; a.click()
    URL.revokeObjectURL(url)
    setModalExport(false)
  }

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Filter sidebar */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filtros</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Buscar', el: <input style={inputStyle} placeholder="Nome ou CNPJ..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} /> },
              { label: 'Segmento', el: <select style={inputStyle} value={filterSegmento} onChange={(e) => { setFilterSegmento(e.target.value); setPage(1) }}><option value="">Todos</option><option value="none">⚠ Sem segmento</option>{segmentos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}</select> },
              { label: 'Relacionamento', el: <select style={{ ...inputStyle, borderColor: filterStatusRel ? 'var(--color-brand-primary)' : 'var(--color-border)' }} value={filterStatusRel} onChange={(e) => { setFilterStatusRel(e.target.value); setPage(1) }}><option value="">Todos</option>{Object.entries(statusRelMap).filter(([k]) => k !== 'nao_definido').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select> },
              { label: 'Produto Contratado', el: <select style={{ ...inputStyle, borderColor: filterProduto ? 'var(--color-brand-primary)' : 'var(--color-border)' }} value={filterProduto} onChange={(e) => { setFilterProduto(e.target.value); setPage(1) }}><option value="">Todos</option>{produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select> },
              { label: 'Pipeline', el: <select style={inputStyle} value={filterPipeline} onChange={(e) => { setFilterPipeline(e.target.value); setPage(1) }}><option value="">Todos</option>{Object.entries(pipelineMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select> },
              { label: 'Empresa Alvo', el: <select style={inputStyle} value={filterAlvo} onChange={(e) => { setFilterAlvo(e.target.value); setPage(1) }}><option value="">Todos</option><option value="sim">Sim</option><option value="nao">Não</option></select> },
              { label: 'UF', el: <select style={inputStyle} value={filterUF} onChange={(e) => { setFilterUF(e.target.value); setPage(1) }}><option value="">Todos</option>{UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}</select> },
              { label: 'Responsável', el: <select style={inputStyle} value={filterUsuario} onChange={(e) => { setFilterUsuario(e.target.value); setPage(1) }}><option value="">Todos</option>{usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}</select> },
            ].map(({ label, el }) => (
              <div key={label}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</div>
                {el}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {hasFilters && <Button variant="ghost" onPress={handleReset} style={{ fontSize: 12 }}>Limpar filtros</Button>}
            <Button variant="outline" onPress={saveState.open} style={{ fontSize: 12 }} isDisabled={!hasFilters}>Salvar filtro</Button>
          </div>

          {filtrosSalvos.length > 0 && (
            <div style={{ marginTop: 14, borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 8 }}>FILTROS SALVOS</div>
              {filtrosSalvos.map((f) => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-muted)', marginBottom: 4, fontSize: 12, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                  <span>{f.nome}</span>
                  <span onClick={() => setFiltrosSalvos((p) => p.filter((x) => x.id !== f.id))} style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1 }}>×</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main table */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Base de Dados</h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{filtered.length} empresas encontradas</p>
          </div>
          <Button variant="outline" onPress={() => abrirModalExport(false)} style={{ fontSize: 13 }}>↓ Exportar CSV</Button>
        </div>

        {/* Barra de seleção */}
        {selecionados.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', marginBottom: 10, background: 'rgba(30,74,159,0.06)', border: '1px solid rgba(30,74,159,0.2)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-brand-primary)' }}>
              {selecionados.size} empresa{selecionados.size > 1 ? 's' : ''} selecionada{selecionados.size > 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" onPress={limparSelecao} style={{ fontSize: 12 }}>Limpar seleção</Button>
              <Button variant="primary" onPress={() => abrirModalExport(true)} style={{ fontSize: 12 }}>↓ Exportar selecionadas</Button>
            </div>
          </div>
        )}

        <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '10px 14px', width: 40 }}>
                  <input
                    type="checkbox"
                    ref={(el) => { if (el) el.indeterminate = algunsDaPaginaSelecionados }}
                    checked={todaAPaginaSelecionada}
                    onChange={togglePagina}
                    style={{ cursor: 'pointer', width: 15, height: 15, accentColor: 'var(--color-brand-primary)' }}
                    aria-label="Selecionar toda a página"
                  />
                </th>
                {['Empresa', 'Segmento', 'Localização', 'Pipeline', 'Alvo', 'Responsável'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>Nenhuma empresa encontrada.</td></tr>
              ) : (
                paginated.map((empresa) => {
                  const seg = segmentos.find((s) => s.id === empresa.segmentoId)
                  const user = usuarios.find((u) => u.id === empresa.usuarioId)
                  const pipeline = pipelineMap[empresa.pipeline]
                  const isSelecionada = selecionados.has(empresa.id)
                  return (
                    <tr key={empresa.id}
                      style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.15s', background: isSelecionada ? 'rgba(30,74,159,0.04)' : '' }}
                      onClick={() => navigate(`/cadastro/empresa/${empresa.id}`)}
                      onMouseEnter={(e) => { if (!isSelecionada) e.currentTarget.style.background = 'var(--color-bg-muted)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = isSelecionada ? 'rgba(30,74,159,0.04)' : '' }}
                    >
                      <td style={{ padding: '11px 14px' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelecionada}
                          onChange={() => toggleSelecionado(empresa.id)}
                          style={{ cursor: 'pointer', width: 15, height: 15, accentColor: 'var(--color-brand-primary)' }}
                          aria-label={`Selecionar ${empresa.razaoSocial}`}
                        />
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{empresa.razaoSocial}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{empresa.cnpj}</div>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: 12 }}>
                        {seg ? (
                          <span style={{ color: 'var(--color-text-secondary)' }}>{seg.nome}</span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#D97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: 10 }}>
                            ⚠ Sem segmento
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--color-text-secondary)' }}>{empresa.cidade ? `${empresa.cidade}, ${empresa.uf}` : '—'}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <Badge variant={pipeline.variant}>{pipeline.label}</Badge>
                          {empresa.statusRelacionamento && empresa.statusRelacionamento !== 'nao_definido' && (
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 10, background: `${statusRelMap[empresa.statusRelacionamento]?.color}20`, color: statusRelMap[empresa.statusRelacionamento]?.color, width: 'fit-content' }}>
                              {statusRelMap[empresa.statusRelacionamento]?.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px' }}><EmpresaAlvoBadge isAlvo={empresa.empresaAlvo} /></td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--color-text-secondary)' }}>{user?.nome ?? '—'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Modal Exportar CSV */}
      {modalExport && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setModalExport(false)}
        >
          <div
            style={{ background: 'var(--color-bg-white)', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.20)', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Exportar CSV</h2>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>
                  {exportarSelecionadas && selecionados.size > 0
                    ? `${selecionados.size} empresa${selecionados.size > 1 ? 's' : ''} selecionada${selecionados.size > 1 ? 's' : ''}`
                    : `${filtered.length} empresa${filtered.length !== 1 ? 's' : ''} (filtro ativo)`}
                </p>
              </div>
              <button onClick={() => setModalExport(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--color-text-muted)', padding: 6, borderRadius: 8 }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Nome do arquivo */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block' }}>Nome do arquivo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <input
                    value={nomeArquivo}
                    onChange={(e) => setNomeArquivo(e.target.value)}
                    style={{ ...inputStyle, borderRadius: '6px 0 0 6px', flex: 1 }}
                    placeholder="base-yeb"
                  />
                  <span style={{ padding: '7px 10px', background: 'var(--color-bg-muted)', border: '1px solid var(--color-border)', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: 13, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    _N-empresas.csv
                  </span>
                </div>
              </div>

              {/* Colunas por grupo */}
              {(['Empresa', 'Contato'] as const).map((grupo) => (
                <div key={grupo}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {grupo === 'Contato' ? 'Contato Principal' : 'Dados da Empresa'}
                    </span>
                    <button
                      onClick={() => {
                        const ids = COLUNAS.filter((c) => c.grupo === grupo).map((c) => c.id)
                        const allOn = ids.every((id) => colunasAtivas.has(id))
                        setColunasAtivas((prev) => {
                          const next = new Set(prev)
                          ids.forEach((id) => allOn ? next.delete(id) : next.add(id))
                          return next
                        })
                      }}
                      style={{ fontSize: 11, color: 'var(--color-brand-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                    >
                      {COLUNAS.filter((c) => c.grupo === grupo).every((c) => colunasAtivas.has(c.id)) ? 'Desmarcar todas' : 'Marcar todas'}
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {COLUNAS.filter((c) => c.grupo === grupo).map((col) => (
                      <label key={col.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, border: `1px solid ${colunasAtivas.has(col.id) ? 'var(--color-brand-primary)' : 'var(--color-border)'}`, background: colunasAtivas.has(col.id) ? 'rgba(30,74,159,0.05)' : 'transparent', cursor: 'pointer', fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={colunasAtivas.has(col.id)}
                          onChange={() => setColunasAtivas((prev) => {
                            const next = new Set(prev)
                            next.has(col.id) ? next.delete(col.id) : next.add(col.id)
                            return next
                          })}
                          style={{ accentColor: 'var(--color-brand-primary)', width: 14, height: 14, flexShrink: 0 }}
                        />
                        <span style={{ color: colunasAtivas.has(col.id) ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{colunasAtivas.size} coluna{colunasAtivas.size !== 1 ? 's' : ''} selecionada{colunasAtivas.size !== 1 ? 's' : ''}</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" onPress={() => setModalExport(false)}>Cancelar</Button>
                <Button variant="primary" isDisabled={colunasAtivas.size === 0} onPress={handleExport}>
                  ↓ Exportar {exportarSelecionadas && selecionados.size > 0 ? `${selecionados.size} empresa${selecionados.size > 1 ? 's' : ''}` : `${filtered.length} empresa${filtered.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save filter modal */}
      <Modal isOpen={saveState.isOpen} onOpenChange={saveState.setOpen}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Salvar Filtro</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4, display: 'block' }}>Nome *</label>
                <input
                  style={{ ...inputStyle, fontSize: 14, padding: '8px 12px' }}
                  placeholder="Ex: Usinas SP em Negociação"
                  value={nomeFiltro}
                  onChange={(e) => setNomeFiltro(e.target.value)}
                  autoFocus
                />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline" onPress={saveState.close}>Cancelar</Button>
                <Button variant="primary" onPress={handleSaveFiltro} isDisabled={!nomeFiltro.trim()}>Salvar</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  )
}
