import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { BuilderPage } from "./pages/BuilderPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { PublicFormPage } from "./pages/PublicFormPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResponsesPage } from "./pages/ResponsesPage";

export function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/form/:slug" element={<PublicFormPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/forms/new" element={<BuilderPage />} />
            <Route path="/forms/:id" element={<BuilderPage />} />
            <Route path="/forms/:id/responses" element={<ResponsesPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

