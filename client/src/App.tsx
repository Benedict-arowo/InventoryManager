import { Route, Routes } from "react-router-dom";
import Expences from "./pages/Expences";
import Sales from "./pages/Sales";
import Home from "./pages/Home";

const App = () => {
	return (
		<div>
			<Routes>
				<Route element={<Home />} path="/" />
				<Route element={<Expences />} path="/expences" />
				<Route element={<Sales />} path="/sales" />
			</Routes>
		</div>
	);
};

export default App;
