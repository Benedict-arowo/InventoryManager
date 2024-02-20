import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ExpencesLocal from "./pages/ExpencesLocal";
import SalesLocal from "./pages/SalesLocal";
import Sidebar from "./components/Sidebar";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Login from "./pages/Login";

const App = () => {
  return (
    <div className="flex flex-row max-h-screen h-full w-full overflow-hidden">
      <Routes>
        <Route element={<Login />} path="/login" />
        <Route path="/" element={<Sidebar />}>
          <Route element={<Home />} path="/dashboard" />
          <Route element={<ExpencesLocal />} path="/expences-local" />
          <Route element={<SalesLocal />} path="/sales-local" />
          <Route element={<Inventory />} path="/inventory" />
          <Route element={<Sales />} path="/sales" />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
