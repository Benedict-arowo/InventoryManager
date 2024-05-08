import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ExpencesLocal from "./pages/ExpencesLocal";
import SalesLocal from "./pages/SalesLocal";
import Sidebar from "./components/Sidebar";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Login from "./pages/Login";
import Summary from "./pages/Summary";
import Purchases from "./pages/Purchases";
import MonthlySummary from "./pages/MonthlySummary";

const App = () => {
  return (
    <div className="flex flex-row max-h-screen overflow-hidden h-full w-full">
      <Routes>
        <Route element={<Login />} path="/login" />
        <Route element={<Summary />} path="/summary/:id" />
        <Route path="/" element={<Sidebar />}>
          <Route element={<Home />} path="" />
          <Route element={<ExpencesLocal />} path="/expences-local" />
          <Route element={<SalesLocal />} path="/sales-local" />
          <Route element={<Inventory />} path="/inventory" />
          <Route element={<Sales />} path="/sales" />
          <Route element={<Purchases />} path="/purchases" />
          <Route element={<MonthlySummary />} path="/m_summary" />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
