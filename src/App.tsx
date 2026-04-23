import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home'
import Login from "./pages/Login"
import PropertyList from "./pages/PropertyList"
import PropertyDetail from "./pages/PropertyDetail"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Dashboard from "./pages/admin/Dashboard"
import Portfolios from "./pages/admin/Portfolios"
import Transactions from "./pages/admin/Transactions"
import Customers from "./pages/admin/Customers"
import Documents from "./pages/admin/Documents"
import Reports from "./pages/admin/Reports"
import Settings from "./pages/admin/Settings"
import NotFound from "./pages/NotFound"
import { AdminLayout } from "./components/AdminLayout"
import { useAuth } from "./hooks/useAuth"

function RequireAuth({ children, minRole }: { children: React.ReactNode; minRole?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const ROLE_HIERARCHY: Record<string, number> = {
    VIEWER: 1,
    AGENT: 2,
    MANAGER: 3,
    ADMIN: 4,
  };

  if (minRole && (ROLE_HIERARCHY[user.role] ?? 0) < (ROLE_HIERARCHY[minRole] ?? 0)) {
    return <Navigate to="/admin" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/ilanlar" element={<PropertyList />} />
      <Route path="/ilanlar/:slug" element={<PropertyDetail />} />
      <Route path="/hakkimizda" element={<About />} />
      <Route path="/iletisim" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="portfolios" element={<RequireAuth minRole="AGENT"><Portfolios /></RequireAuth>} />
        <Route path="transactions" element={<RequireAuth minRole="AGENT"><Transactions /></RequireAuth>} />
        <Route path="customers" element={<RequireAuth minRole="AGENT"><Customers /></RequireAuth>} />
        <Route path="documents" element={<RequireAuth minRole="AGENT"><Documents /></RequireAuth>} />
        <Route path="reports" element={<RequireAuth minRole="MANAGER"><Reports /></RequireAuth>} />
        <Route path="settings" element={<RequireAuth minRole="ADMIN"><Settings /></RequireAuth>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
