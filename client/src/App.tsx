import { Route, Routes } from "react-router-dom";
import Expences from "./pages/Expences";
import Sales from "./pages/Sales";
import Home from "./pages/Home";
import ExpencesLocal from "./pages/ExpencesLocal";
import SalesLocal from "./pages/SalesLocal";
import Sidebar from "./components/Sidebar";

const App = () => {
	return (
		<div className="flex flex-row max-h-screen h-full w-full">
			<Sidebar />
			<Routes>
				<Route element={<Home />} path="/" />
				<Route element={<ExpencesLocal />} path="/expences-local" />
				<Route element={<SalesLocal />} path="/sales-local" />
			</Routes>
		</div>
	);
};

export default App;
