import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Inicio from './pages/Inicio'
import Cadastro from './pages/Cadastro'
import EmpresaList from './pages/cadastro/EmpresaList'
import EmpresaDetail from './pages/cadastro/EmpresaDetail'
import ProdutoList from './pages/cadastro/ProdutoList'
import SegmentoList from './pages/cadastro/SegmentoList'
import UsuarioList from './pages/cadastro/UsuarioList'
import BaseDados from './pages/BaseDados'
import Pipeline from './pages/Pipeline'
import Eficiencia from './pages/Eficiencia'
import Indicadores from './pages/Indicadores'
import MapaGuerra from './pages/MapaGuerra'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Inicio />} />

        <Route path="cadastro" element={<Cadastro />}>
          <Route index element={<Navigate to="empresa" replace />} />
          <Route path="empresa" element={<EmpresaList />} />
          <Route path="empresa/:id" element={<EmpresaDetail />} />
          <Route path="produto" element={<ProdutoList />} />
          <Route path="segmento" element={<SegmentoList />} />
          <Route path="usuario" element={<UsuarioList />} />
        </Route>

        <Route path="base-dados" element={<BaseDados />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="eficiencia" element={<Eficiencia />} />
        <Route path="indicadores" element={<Indicadores />} />
        <Route path="mapa-guerra" element={<MapaGuerra />} />
      </Route>
    </Routes>
  )
}

export default App
