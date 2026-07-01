import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { RegistroDiarioPage } from './features/registro-diario/RegistroDiarioPage';
import { ReceitasPage } from './features/receitas/ReceitasPage';
import { PlanejamentoPage } from './features/planejamento/PlanejamentoPage';
import { ListaComprasPage } from './features/compras/ListaComprasPage';
import { RelatoriosPage } from './features/relatorios/RelatoriosPage';
import { ConfiguracoesPage } from './features/configuracoes/ConfiguracoesPage';
import { CategoriasPage } from './features/categorias/CategoriasPage';
import { AlimentosPage } from './features/alimentos/AlimentosPage';
import { PerfilPage } from './features/perfil/PerfilPage';
import { ImportPage } from './features/import/ImportPage';
import { ThemeProvider } from './shared/components/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="diario" element={<RegistroDiarioPage />} />
            <Route path="planejamento" element={<PlanejamentoPage />} />
            <Route path="compras" element={<ListaComprasPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
            <Route path="categorias" element={<CategoriasPage />} />
            <Route path="alimentos" element={<AlimentosPage />} />
            <Route path="receitas" element={<ReceitasPage />} />
            <Route path="perfil" element={<PerfilPage />} />
            <Route path="import" element={<ImportPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
