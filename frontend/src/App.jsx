import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import DashboardLayout from "./layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
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
import { PurchaseList } from './pages/PurchaseList';
import { PurchaseForm } from './pages/PurchaseForm';
import { SalesDashboard } from './pages/SalesDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
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

            {/* PURCHASES */}
            <Route path="achats">
              <Route index element={<PurchaseList />} />
              <Route path="new" element={<PurchaseForm />} />
              <Route path=":id/edit" element={<PurchaseForm />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}