import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";

import { SalesList } from './pages/SalesList';
import { SalesForm } from './pages/SalesForm';
import { ClientList } from './pages/ClientList';
import { ProductList } from './pages/ProductList';
import { ClientForm } from './pages/ClientForm';
import { ProductForm } from './pages/ProductForm';
import { FournisseurList } from './pages/FournisseurList';
import { CategorieList } from './pages/CategorieList';
import { FournisseurForm } from './pages/FournisseurForm';
import { CategorieForm } from './pages/CategorieForm';
import { SalesDashboard } from './pages/SalesDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<SalesDashboard />} />

          {/* SALES */}
          <Route path="sales">
            <Route index element={<SalesList />} />
            <Route path="new" element={<SalesForm />} />
            <Route path=":id/edit" element={<SalesForm />} />
          </Route>

          {/* CLIENTS */}
          <Route path="clients">
            <Route index element={<ClientList />} />
            <Route path="new" element={<ClientForm />} />
            <Route path=":id/edit" element={<ClientForm />} />
          </Route>

          {/* PRODUCTS */}
          <Route path="products">
            <Route index element={<ProductList />} />
            <Route path="new" element={<ProductForm />} />
            <Route path=":id/edit" element={<ProductForm />} />
          </Route>

          {/* FOURNISSEURS */}
          <Route path="fournisseurs">
            <Route index element={<FournisseurList />} />
            <Route path="new" element={<FournisseurForm />} />
            <Route path=":id/edit" element={<FournisseurForm />} />
          </Route>

          {/* CATEGORIES */}
          <Route path="categories">
            <Route index element={<CategorieList />} />
            <Route path="new" element={<CategorieForm />} />
            <Route path=":id/edit" element={<CategorieForm />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}