import { Route, Routes } from "react-router-dom";
import Expences from "./pages/Expences";
import Sales from "./pages/Sales";
import Home from "./pages/Home";
import ExpencesLocal from "./pages/ExpencesLocal";
import SalesLocal from "./pages/SalesLocal";

const App = () => {
	return (
		<div>
			<Routes>
				<Route element={<Home />} path="/" />
				<Route element={<ExpencesLocal />} path="/expences-local" />
				<Route element={<SalesLocal />} path="/sales-local" />
			</Routes>
		</div>
	);
};

export default App;
