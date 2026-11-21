import { Route, Routes } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AppLayout } from "../pages/app/AppLayout";
import { PainelPage } from "../pages/PainelPage";
import { AnalisePage } from "../pages/analise/AnalisePage";
import { CadastroPage } from "../pages/CadastroPage";
import { LoginPage } from "../pages/LoginPage";
import { CatalogoPage } from "../pages/catalogo/CatalogoPage";
import { CategoriaFormPage } from "../pages/categorias/CategoriaFormPage";
import { CategoriasListPage } from "../pages/categorias/CategoriasListPage";
import { MinhaContaPage } from "../pages/conta/MinhaContaPage";
import { EnderecoFormPage } from "../pages/enderecos/EnderecoFormPage";
import { EnderecosListPage } from "../pages/enderecos/EnderecosListPage";
import { HomePage } from "../pages/home/HomePage";
import { PedidoFormPage } from "../pages/pedidos/PedidoFormPage";
import { PedidosListPage } from "../pages/pedidos/PedidosListPage";
import { ProdutoFormPage } from "../pages/produtos/ProdutoFormPage";
import { ProdutosListPage } from "../pages/produtos/ProdutosListPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/produtos" element={<CatalogoPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Tudo em /app/* exige login */}
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<PainelPage />} />
          <Route path="conta" element={<MinhaContaPage />} />
          <Route path="analise" element={<AnalisePage />} />

          <Route path="produtos" element={<ProdutosListPage />} />
          <Route path="produtos/novo" element={<ProdutoFormPage />} />
          <Route path="produtos/:id/editar" element={<ProdutoFormPage />} />

          <Route path="categorias" element={<CategoriasListPage />} />
          <Route path="categorias/novo" element={<CategoriaFormPage />} />
          <Route path="categorias/:id/editar" element={<CategoriaFormPage />} />

          <Route path="enderecos" element={<EnderecosListPage />} />
          <Route path="enderecos/novo" element={<EnderecoFormPage />} />
          <Route path="enderecos/:id/editar" element={<EnderecoFormPage />} />

          <Route path="pedidos" element={<PedidosListPage />} />
          <Route path="pedidos/novo" element={<PedidoFormPage />} />
          <Route path="pedidos/:id/editar" element={<PedidoFormPage />} />
        </Route>

        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
