import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LayoutContent from "./layout/LayoutContent";
import Home from "./pages/home/Home";
import SignInForm from "./pages/Auth/login/SignInForm";
import Listinvestment from "./pages/investmentDetails/ListInvestmentDetails";
import NotFound from "./pages/404/NotFound";
import Calendar from "./pages/Calendar";
import Setting from "./pages/setting/Setting";
import ListHoliday from "./pages/workforce/holiday/ListHoliday";
import Attendance from "./pages/attendance/Attendance";
import ViewPayrollPage from "./pages/payroll/ViewPayrollPage";
import MainLeave from "./pages/workforce/leave/MainLeave";
import SignUpForm from "./pages/Auth/login/SignUpForm";
import Payout from "./pages/payouts/PayoutsMain";
import PrivateRoute from "./components/auth/PrivateRoute.tsx";

function App() {
  return (
    <Router>
      <div className="h-full w-full">
        <Routes>
          <Route
            element={
              <PrivateRoute>
                <LayoutContent />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/investment-details" element={<Listinvestment />} />
            <Route path="/investment-payouts" element={<Payout />} />
            <Route path="/workforce/holiday" element={<ListHoliday />} />
            <Route path="/workforce/leave" element={<MainLeave />} />
            <Route path="/workforce/events" element={<Calendar />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/payroll" element={<ViewPayrollPage />} />
            <Route path="/settings" element={<Setting />} />
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
