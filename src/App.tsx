import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Inicio from './pages/Inicio'
import Cadastro from './pages/Cadastro'
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
        <Route path="cadastro" element={<Cadastro />} />
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
