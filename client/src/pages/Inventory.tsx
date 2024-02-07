import { useEffect, useState } from "react";
import { InventoryItems } from "../types";
import {
	Autocomplete,
	Backdrop,
	Fab,
	Fade,
	Modal,
	TextField,
	Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const Inventory = () => {
	const [inventoryItems, setInventoryItems] = useState<InventoryItems[]>([]);
	const [openNewItemModal, setOpenNewItemModal] = useState(false);
	const [search, setSearch] = useState("");

	// TODO: Error catching
	const fetchItems = () => {
		fetch("http://localhost:8000/api/stock", {
			method: "GET",
		})
			.then((res) => res.json())
			.then((data) => setInventoryItems(() => data.data))
			.catch((err) => console.log(err));
	};

	useEffect(() => {
		fetchItems();
	}, []);

	const columns: GridColDef[] = [
		{ field: "id", headerName: "ID", width: 90 },
		{
			field: "name",
			headerName: "Item Name",
			width: 150,
			editable: false,
		},
		{
			field: "quantity",
			headerName: "Amount In Stock",
			width: 150,
			editable: false,
		},
		{
			field: "price_per_unit",
			headerName: "Price Per Unit",
			type: "number",
			width: 100,
			editable: false,
		},
		{
			field: "quantity_sold",
			headerName: "Amount Sold",
			description: "This column has a value getter and is not sortable.",
			sortable: true,
			width: 100,
		},
	];

	return (
		<main className="p-4 w-full">
			<header className="grid place-items-center w-full">
				<Autocomplete
					freeSolo
					id="free-solo-2-demo"
					disableClearable
					className="w-full max-w-[500px]"
					options={inventoryItems.map((item) => item.name)}
					renderInput={(params) => (
						<TextField
							{...params}
							label="Search input"
							InputProps={{
								...params.InputProps,
								type: "search",
							}}
						/>
					)}
					onInputChange={(_event, newInputValue) => {
						setSearch(() => newInputValue);
					}}
					inputValue={search}
				/>
			</header>

			<div className="h-[80%] mt-4">
				<DataGrid
					rows={inventoryItems.filter(
						(item) =>
							item.name
								.toLowerCase()
								.startsWith(search.toLowerCase()) ||
							item.name
								.toLowerCase()
								.endsWith(search.toLowerCase())
					)}
					columns={columns}
					initialState={{
						pagination: {
							paginationModel: {
								pageSize: 5,
							},
						},
					}}
					pageSizeOptions={[5, 10, 15, 20, 30, 40, 50]}
					// checkboxSelection
					// disableRowSelectionOnClick
				/>
			</div>

			{/* Add new item modal */}
			<Modal
				aria-labelledby="transition-modal-title"
				aria-describedby="transition-modal-description"
				open={openNewItemModal}
				onClose={() => setOpenNewItemModal(() => false)}
				closeAfterTransition
				slots={{ backdrop: Backdrop }}
				slotProps={{
					backdrop: {
						timeout: 500,
					},
				}}>
				<Fade in={openNewItemModal}>
					<div className="bg-white">
						<Typography
							id="transition-modal-title"
							variant="h6"
							component="h2">
							Text in a modal
						</Typography>
						<Typography
							id="transition-modal-description"
							sx={{ mt: 2 }}>
							Duis mollis, est non commodo luctus, nisi erat
							porttitor ligula.
						</Typography>
					</div>
				</Fade>
			</Modal>

			{/* Add Icon */}
			<Fab
				color="primary"
				aria-label="add"
				size="medium"
				onClick={() => setOpenNewItemModal(() => true)}
				sx={{
					position: "absolute",
					bottom: 16,
					right: 32,
				}}>
				<AddIcon />
			</Fab>
		</main>
	);
};

export default Inventory;
