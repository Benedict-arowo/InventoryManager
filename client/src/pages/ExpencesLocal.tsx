import React, { useEffect, useRef, useState } from "react";
import {
	DataGrid,
	GridActionsCellItem,
	GridColDef,
	GridDeleteIcon,
	GridEventListener,
	GridRowEditStopReasons,
	GridRowId,
	GridRowModes,
	GridRowModesModel,
	GridToolbar,
} from "@mui/x-data-grid";
import { v4 as uuidv4 } from "uuid";
import { Autocomplete, Button, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";

type ItemInState = {
	id: string;
	name: string;
	price_per_unit: number;
	amount_bought: number;
	total: number;
	category: string;
};

type Item = {
	name: string;
	price_per_unit: string;
	amount_bought: string;
	category: string;
};

type localStorageStateProps = {
	names: string[];
	categories: string[];
};

const ExpencesLocal = () => {
	const [items, setItems] = useState<ItemInState[]>([]);
	const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
		{}
	);
	const inputElement = useRef();
	const [total, setTotal] = useState(0);
	const [controlledInputs, setControllerInputs] = useState({
		name: "",
		price_per_unit: "",
		amount_bought: "",
		category: "",
	});
	const [localStorageState, setLocalStorageState] =
		useState<localStorageStateProps>({
			names: [],
			categories: [],
		});

	const DEFAULT_CATEGORY = "MISC";
	const [priceList, setPriceList] = useState<string[]>([]);

	const updatePriceList = (itemName: string) => {
		const priceList: string[] = [];
		items.forEach((item) =>
			item.name === itemName
				? priceList.push(item.price_per_unit.toString())
				: undefined
		);

		setPriceList(() => priceList);
	};

	const getTotal = (item: ItemInState[]) => {
		let _total = 0;
		item.forEach((item) => {
			_total += item.total;
		});
		setTotal(() => _total);
	};

	const addNewItem = (item: Item) => {
		if (!item.name) throw new Error("Missing item name");

		if (item.amount_bought) {
			if (isNaN(Number(item.amount_bought)))
				throw new Error("Invalid item bought amount.");
		} else throw new Error("Missing item amount_bought");

		let item_price_per_unit;
		console.log(item.price_per_unit.length);
		if (item.price_per_unit.length === 0) {
			const findItem = items.find(
				(inStateItem) =>
					inStateItem.name.toUpperCase() === item.name.toUpperCase()
			);

			if (findItem) item_price_per_unit = findItem.price_per_unit;
			else throw new Error("Missing item amount_per_unit");
		} else {
			if (isNaN(Number(item.price_per_unit)))
				throw new Error("Invalid price per unit.");
			item_price_per_unit = Number(item.price_per_unit);
		}

		let item_category = "";
		if (item.category.length === 0) {
			// Tries to check if the item already exists in our database,
			// and if it does it uses the category property,
			// else it uses the default category name
			const findItem = items.find(
				(inStateItem) =>
					inStateItem.name.toLowerCase() ===
						item.name.toLowerCase() &&
					inStateItem.category.toUpperCase() !==
						DEFAULT_CATEGORY.toUpperCase()
			);

			if (findItem) item_category = findItem.category;
			else item_category = DEFAULT_CATEGORY.toUpperCase();
		} else {
			item_category = item.category.toUpperCase();
		}

		const newItem: ItemInState = {
			id: uuidv4(),
			...item,
			amount_bought: Number(item.amount_bought),
			price_per_unit: Number(item_price_per_unit),
			total: Number(item.amount_bought) * Number(item_price_per_unit),
			category: item_category,
		};

		setItems((prev: ItemInState[]) => [...prev, newItem]);

		updateLocalStorage(newItem);
		resetInputs();
		console.log(inputElement);
		if (inputElement.current) inputElement.current.focus();
	};

	const resetInputs = () => {
		setControllerInputs(() => ({
			name: "",
			price_per_unit: "",
			amount_bought: "",
			category: "",
		}));
	};

	const handleRowEditStop: GridEventListener<"rowEditStop"> = (
		params,
		event
	) => {
		if (params.reason === GridRowEditStopReasons.rowFocusOut) {
			event.defaultMuiPrevented = true;
		}
	};

	const handleEditClick = (id: GridRowId) => () => {
		setRowModesModel({
			...rowModesModel,
			[id]: { mode: GridRowModes.Edit },
		});
	};

	const handleSaveClick = (id: GridRowId) => () => {
		setRowModesModel({
			...rowModesModel,
			[id]: { mode: GridRowModes.View },
		});
	};

	const handleDeleteClick = (id: GridRowId) => () => {
		setItems((items) => items.filter((item) => item.id !== id));
	};

	const handleCancelClick = (id: GridRowId) => () => {
		setRowModesModel({
			...rowModesModel,
			[id]: { mode: GridRowModes.View, ignoreModifications: true },
		});
	};

	const handleProcessRowUpdateError = (err: Error) => {
		console.log(err);
		alert(err.message);
	};
	const processRowUpdate = (newRow: ItemInState) => {
		// TODO: check that it's valid data being saved
		if (!newRow.name) throw new Error("Missing item name");
		if (!newRow.amount_bought)
			throw new Error("Missing item amount_bought");
		if (!newRow.price_per_unit)
			throw new Error("Missing item amount_per_unit");
		// Calculates the new total for the item being saved!
		const updatedItem = {
			...newRow,
			total: newRow.price_per_unit * newRow.amount_bought,
		};

		setItems((items: ItemInState[]) =>
			items.map((item) => (item.id === newRow.id ? updatedItem : item))
		);

		return updatedItem;
	};

	const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
		setRowModesModel(newRowModesModel);
	};

	const getUniqueValues = (...args: Array<string>) => {
		// Returns a list of unique values
		const newArray = new Set(args.flat());
		return Array.from(newArray);
	};

	const columns: GridColDef[] = [
		{ field: "id", headerName: "ID", width: 70, hideable: true },
		{
			field: "name",
			headerName: "Name",
			width: 200,
			sortable: true,
			editable: true,
		},
		{
			field: "price_per_unit",
			headerName: "Price Per Unit",
			type: "number",
			width: 100,
			sortable: true,
			editable: true,
		},
		{
			field: "amount_bought",
			headerName: "Quantity",
			type: "number",
			width: 70,
			sortable: true,
			editable: true,
		},
		{
			field: "total",
			headerName: "Total",
			type: "number",
			sortable: true,
			width: 120,
		},
		{
			field: "category",
			headerName: "Category",
			type: "singleSelect",
			sortable: true,
			width: 140,
			editable: true,
			valueOptions: [...new Set(items.map((item) => item.category))],
		},
		{
			field: "actions",
			type: "actions",
			headerName: "Actions",
			width: 100,
			cellClassName: "actions",
			getActions: ({ id }) => {
				const isInEditMode =
					rowModesModel[id]?.mode === GridRowModes.Edit;

				if (isInEditMode) {
					return [
						<GridActionsCellItem
							icon={<SaveIcon />}
							label="Save"
							sx={{
								color: "primary.main",
							}}
							onClick={handleSaveClick(id)}
						/>,
						<GridActionsCellItem
							icon={<CancelIcon />}
							label="Cancel"
							className="textPrimary"
							onClick={handleCancelClick(id)}
							color="inherit"
						/>,
					];
				}

				return [
					<GridActionsCellItem
						icon={<EditIcon />}
						label="Edit"
						className="textPrimary"
						onClick={handleEditClick(id)}
						color="inherit"
					/>,
					<GridActionsCellItem
						icon={<GridDeleteIcon />}
						label="Delete"
						onClick={handleDeleteClick(id)}
						color="inherit"
					/>,
				];
			},
		},
	];

	useEffect(() => {
		getTotal(items);
		console.log("running");
	}, [items]);

	const mergeDuplicates = (items: ItemInState[]) => {
		const updatedItems: ItemInState[] = [];
		// Loops through each item, and check if the item already exists in updatedItems array.
		// If item already exists, then update the existing item in the updatedItems array
		// If item doesn't exist in the updatedItems array, then create a new one in the updatedItems array.

		items.forEach((item) => {
			// Find the index of the item with the same name, and price in updatedItems
			const index = updatedItems.findIndex(
				(updatedItem) =>
					updatedItem.name.toUpperCase() ===
						item.name.toUpperCase() &&
					updatedItem.price_per_unit === item.price_per_unit
			);

			if (index !== -1) {
				// If the item already exists, update it
				const updated_amount_bought =
					item.amount_bought + updatedItems[index].amount_bought;

				updatedItems[index] = {
					...updatedItems[index],
					amount_bought: updated_amount_bought,
					total: updated_amount_bought * item.price_per_unit,
				};
			} else {
				// If the item doesn't exist, add it to updatedItems
				updatedItems.push(item);
			}
		});

		setItems(() => updatedItems);
		// Now, updatedItems contains unique items based on the 'name', and 'price_per_unit' property
		return 0;
	};

	const updateLocalStorage = (item: ItemInState) => {
		const localStorageNames = localStorage.getItem("item-names");
		const localStorageCategories = localStorage.getItem("item-categories");

		if (localStorageNames) {
			const existingItems = new Set(JSON.parse(localStorageNames));
			existingItems.add(item.name);

			localStorage.setItem(
				"item-names",
				JSON.stringify(Array.from(existingItems))
			);
		} else {
			localStorage.setItem("item-names", JSON.stringify([item.name]));
		}

		if (localStorageCategories) {
			const existingCategories = new Set(
				JSON.parse(localStorageCategories)
			);
			existingCategories.add(item.category);

			localStorage.setItem(
				"item-categories",
				JSON.stringify(Array.from(existingCategories))
			);
		} else {
			localStorage.setItem(
				"item-categories",
				JSON.stringify([item.category])
			);
		}
	};

	const saveToLocalStorage = (items: ItemInState[]) => {
		localStorage.setItem("items", JSON.stringify(items));
	};

	useEffect(() => {
		if (items.length > 0) saveToLocalStorage(items);
	}, [items]);

	useEffect(() => {
		// If there is items available in the localstorage, it uses it and saves them inside the item state.
		const ItemsFromLocalStorage = localStorage.getItem("items");
		if (ItemsFromLocalStorage && ItemsFromLocalStorage.length > 0) {
			setItems(() => JSON.parse(ItemsFromLocalStorage));
		}

		const namesInLocalStorage = localStorage.getItem("item-names");
		const categoriesInLocalStorage =
			localStorage.getItem("item-categories");

		if (namesInLocalStorage) {
			setLocalStorageState((prev) => {
				return {
					names: [...prev.names, ...JSON.parse(namesInLocalStorage)],
					categories: prev.categories,
				};
			});
		}
		if (categoriesInLocalStorage) {
			setLocalStorageState((prev) => {
				return {
					categories: [
						...prev.categories,
						...JSON.parse(categoriesInLocalStorage),
					],
					names: prev.names,
				};
			});
		}
	}, []);

	const clearItems = () => {
		const ask = prompt("Are you sure you want to clear? (yes)");
		if (ask?.toLowerCase() === "yes") {
			localStorage.removeItem("items");
			setItems(() => []);
		}
	};

	return (
		<main className="flex flex-row gap-0 max-h-screen overflow-y-hidden">
			<section className="min-w-[350px] px-2 bg-blue-400 h-screen flex flex-col gap-1 py-2">
				<p>Total {total}</p>
				<Autocomplete
					freeSolo
					id="item_name_search"
					disableClearable
					ref={inputElement}
					// TODO: Use data from localStorage and state
					options={getUniqueValues(
						items.map((item) => item.name.toLowerCase()),
						localStorageState.names
					)}
					renderInput={(params) => (
						<TextField
							{...params}
							label="Item Name"
							InputProps={{
								...params.InputProps,
								type: "search",
							}}
						/>
					)}
					onInputChange={(_event, newInputValue) => {
						updatePriceList(newInputValue);
						setControllerInputs((prev) => ({
							...prev,
							name: newInputValue,
						}));
					}}
					inputValue={controlledInputs.name}
				/>

				<Autocomplete
					freeSolo
					id="item_price_per_unit"
					disableClearable
					// TODO: Use data from localStorage and state
					options={getUniqueValues(priceList)}
					openOnFocus={true}
					renderInput={(params) => (
						<TextField
							{...params}
							label="Price per unit"
							InputProps={{
								...params.InputProps,
								type: "search",
							}}
						/>
					)}
					onInputChange={(_event, newInputValue) => {
						setControllerInputs((prev) => ({
							...prev,
							price_per_unit: newInputValue,
						}));
					}}
					inputValue={controlledInputs.price_per_unit}
				/>

				<TextField
					label="Quantity"
					variant="outlined"
					value={controlledInputs.amount_bought}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setControllerInputs((prev) => ({
							...prev,
							amount_bought: e.target.value,
						}));
					}}
				/>

				{/* TODO: Get data from both localstorage and state */}
				<Autocomplete
					freeSolo
					id="item_category_search"
					options={getUniqueValues(
						items.map((item) => item.category),
						localStorageState.categories
					)}
					renderInput={(params) => (
						<TextField
							{...params}
							label="Category"
							InputProps={{
								...params.InputProps,
								type: "search",
							}}
						/>
					)}
					onInputChange={(_event, newInputValue) => {
						setControllerInputs((prev) => ({
							...prev,
							category: newInputValue,
						}));
					}}
					inputValue={controlledInputs.category}
				/>

				<Button
					variant="contained"
					onClick={() =>
						addNewItem({
							name: controlledInputs.name,
							amount_bought: controlledInputs.amount_bought,
							price_per_unit: controlledInputs.price_per_unit,
							category: controlledInputs.category,
						})
					}>
					Add
				</Button>
				<Button
					variant="outlined"
					onClick={() => mergeDuplicates(items)}>
					Merge
				</Button>
				<Button variant="outlined" onClick={() => clearItems()}>
					Clear
				</Button>
			</section>
			<aside className="flex-1 bg-white h-screen flex justify-center">
				<div className="h-full w-full">
					<DataGrid
						rows={items}
						columns={columns}
						editMode="row"
						initialState={{
							pagination: {
								paginationModel: { page: 0, pageSize: 10 },
							},
						}}
						pageSizeOptions={[5, 10, 20]}
						checkboxSelection={true}
						rowModesModel={rowModesModel}
						onRowModesModelChange={handleRowModesModelChange}
						onRowEditStop={handleRowEditStop}
						processRowUpdate={processRowUpdate}
						slots={{ toolbar: GridToolbar }}
						onProcessRowUpdateError={handleProcessRowUpdateError}
					/>
				</div>
			</aside>
		</main>
	);
};

export default ExpencesLocal;
