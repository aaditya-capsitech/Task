import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";
import axios from "axios";
import LoginForm from "./components/Login";
import RegisterForm from "./components/Register";
import Dashboard from "./pages/Dashboard";
import ClientHome from "./pages/ClientHome";
import ClientLayout from "./components/ClientLayout";
import BusinessDetail from "./components/BusinessDetail";
import ClientsContactsTab from "./components/ClientsContactsTab"; //render it agn
import Email from "./pages/Email";
import Calendar from "./pages/Calendar";
import Tasks from "./pages/Tasks";
import Documents from "./pages/Documents";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import ContactDetail from "./pages/ContactDetail";
// Initialize Fluent UI icons
initializeIcons();

// Set global token for axios
const token = localStorage.getItem("token") || sessionStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
axios.defaults.baseURL = "http://localhost:5288";

// Dynamic redirect based on user role for /client/business/:id
const RedirectClientBusinessByRole = () => {
  const { id } = useParams();
  const userData = localStorage.getItem("user") || sessionStorage.getItem("user");
  let role = "User";

  try {
    const user = JSON.parse(userData || "{}");
    role = user.role || "User";
  } catch {
    // fallback
  }

  const target =
    role === "Admin"
      ? `/admin/clients/business/${id}`
      : `/user/business/${id}`;

  return <Navigate to={target} replace />;
};

// Optional: keep these only if needed elsewhere
const RedirectToAdminBusiness = () => {
  const { id } = useParams();
  return <Navigate to={`/admin/clients/business/${id}`} replace />;
};

const RedirectToAdminContact = () => {
  const { id } = useParams();
  return <Navigate to={`/admin/contact/${id}`} replace />;
};

const RedirectToClientContact = () => {
  const { id } = useParams();
  return <Navigate to={`/user/contact/${id}`} replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={["Admin"]} element={<ClientLayout />} />}
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<ClientHome />} />
          <Route path="clients/business/:id" element={<BusinessDetail />} />
          <Route path="contact/:id" element={<ContactDetail />} />
          <Route path="contacts" element={<ClientsContactsTab />} />
          <Route path="email" element={<Email />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="documents" element={<Documents />} />
          <Route path="settings/profile" element={<ProfilePage />} />
        </Route>

        {/* User Routes */}
        <Route
          path="/user"
          element={<ProtectedRoute allowedRoles={["User", "Admin"]} element={<ClientLayout />} />}
        >
          <Route index element={<ClientHome />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<ClientHome />} />
          <Route path="business/:id" element={<BusinessDetail />} />
          <Route path="contact/:id" element={<ContactDetail />} />
          <Route path="contacts" element={<ClientsContactsTab />} />
          <Route path="email" element={<Email />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="documents" element={<Documents />} />
          <Route path="settings/profile" element={<ProfilePage />} />
        </Route>

        {/* Global Redirects for Deep Links */}
        <Route path="/client/business/:id" element={<RedirectClientBusinessByRole />} />
        <Route path="/clients/business/:id" element={<RedirectToAdminBusiness />} />
        <Route path="/contact/:id" element={<RedirectToAdminContact />} />
        <Route path="/client/contact/:id" element={<RedirectToClientContact />} />

        {/* Breadcrumb-friendly fallback routes */}
        <Route path="/client" element={<Navigate to="/user/clients" replace />} />
        <Route path="/client/dashboard" element={<Navigate to="/user/dashboard" replace />} />
       
        <Route path="/client/business/:id" element={<Navigate to="/user/business/:id" replace />} />
        <Route path="/admin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/contact/:id" element={<Navigate to="/admin/contact/:id" replace />} />
        <Route path="/admin/business/:id" element={<Navigate to="/admin/clients/business/:id" replace />} />

        {/* 404 fallback */}
        <Route
          path="*"
          element={<div style={{ padding: 40, fontSize: 24 }}>404 - Page Not Found</div>}
        />
      </Routes>
    </Router>
  );
}

export default App;
