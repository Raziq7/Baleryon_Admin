import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LayoutContent from "./layout/LayoutContent";
import Home from "./pages/home/Home";
import SignInForm from "./pages/Auth/login/SignInForm";
import NotFound from "./pages/404/NotFound";
import Calendar from "./pages/Calendar";
import Setting from "./pages/setting/Setting";
import MainLeave from "./pages/workforce/leave/MainLeave";
import SignUpForm from "./pages/Auth/login/SignUpForm";
import UserManagementMain from "./pages/users/UserManagementMain";
import PrivateRoute from "./components/auth/PrivateRoute.tsx";
import ProductManagement from "./pages/Products/ProductManagement.tsx";
import AddProduct from "./pages/Products/AddProduct.tsx";
import EditProduct from "./pages/Products/EditProduct";
import ViewProduct from "./pages/Products/ViewProduct";
import LandingPage from "./pages/cms/LandingPage";
import AdminUserDetailsPage from "./pages/users/UserDetailsPage.tsx";
import OrderManagement from "./pages/orders/OrderManagement.tsx";
import OrderDetailsPage from "./components/order/OrderDetailsPage.tsx";
import ReportManagement from "./pages/Report/ReportManagement.tsx";
import InventoryTab from "./pages/Inventory/Inventory.tsx";

function App() {
  return (
    <Router>
      <div className="h-full w-full">
        <Routes>
          <Route
            element={
              <PrivateRoute>
                <LayoutContent />
                //{" "}
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/product-management" element={<ProductManagement />} />
            <Route path="/product-management/add" element={<AddProduct />} />
            <Route
              path="/product-management/view/:id"
              element={<ViewProduct />}
            />
            <Route
              path="/product-management/edit/:id"
              element={<EditProduct />}
            />
            <Route path="/admin/users" element={<UserManagementMain />} />
            <Route
              path="/admin/users/:userId"
              element={<AdminUserDetailsPage />}
            />

            <Route path="/order-management" element={<OrderManagement />} />

            <Route
              path="/order-management/:orderId"
              element={<OrderDetailsPage />}
            />

            <Route path="/report-management" element={<ReportManagement />} />
            <Route path="/inventory-management" element={<InventoryTab />} />

            <Route path="/workforce/leave" element={<MainLeave />} />
            <Route path="/workforce/events" element={<Calendar />} />
            <Route path="/settings" element={<Setting />} />
            <Route path="/cms/landing-page" element={<LandingPage />} />
          </Route>

          <Route path="/signin" element={<SignInForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
