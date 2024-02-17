import { useEffect, useState } from "react";
import { SERVER_URL } from "../utils";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { format } from "timeago.js";

type Item = {
	id: string;
	created_at: Date;
	updated_at: Date;
	name: string;
	quantity: number;
	price_per_unit: number;
	quantity_sold: number;
	low_stock_threshold: number;
	use_quantity: false;
	use_amount: false;
	is_service: false;
	category: string;
};

type Sale = {
	id: number;
	created_at: Date;
	updated_at: Date;
	price: number;
	quantity: number;
	amount_paid: number;
	status: string;
	payment_method: string;
	total: number;
	change: number;
	item: Item;
	sold_by: number;
};

const Sales = () => {
	const [salesItems, setSalesItems] = useState<Sale[]>([]);

	const totalBodyTemplate = (item: Sale) => {
		return <p>{item.price * item.quantity}</p>;
	};

	const paymentBodyTemplate = (item: Sale) => {
		return (
			<p className="text-sm font-light px-4 py-1">
				{item.payment_method}
			</p>
		);
	};

	const statusBodyTemplate = (item: Sale) => {
		const getSeverity = (item: Sale) => {
			if (item.status.toUpperCase() === "PAID") return "success";
			else if (item.status.toUpperCase() === "PENDING") return "warning";
			else return "danger";
		};

		return (
			<Tag
				className="text-white"
				value={item.status.toUpperCase()}
				severity={getSeverity(item)}></Tag>
		);
	};

	useEffect(() => {
		fetch(`${SERVER_URL}/api/sales?date=2024-02-16`, { method: "GET" })
			.then((res) => res.json())
			.then((data) => setSalesItems(data.data))
			.catch((err) => console.log(err));
	}, []);

	return (
		<div className="w-full relative">
			Sales 1
			<div className="h-[90vh] overflow-auto">
				<DataTable
					value={salesItems}
					stateStorage="session"
					// alwaysShowPaginator={false}
					stripedRows
					// paginatorClassName="absolute bottom-0 left-0 right-0"
					paginator
					rows={10}
					checkIcon
					sortMode="multiple"
					removableSort
					paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
					currentPageReportTemplate="{first} to {last} of {totalRecords}"
					rowsPerPageOptions={[10, 25, 50]}
					className="h-full"
					tableStyle={{}}>
					<Column
						field="id"
						header="#"
						style={{ width: "32px", fontSize: ".8rem" }}></Column>
					<Column field="item.name" header="Name"></Column>
					{/* <Column field="category" header="Category"></Column> */}
					<Column field="quantity" header="Quantity"></Column>
					<Column field="price" header="Price"></Column>
					<Column field="amount_paid" header="Amount Paid"></Column>
					<Column body={totalBodyTemplate} header="Total"></Column>
					<Column body={statusBodyTemplate} header="Status"></Column>
					{/* <Column body={paymentBodyTemplate} header="Method"></Column> */}
					<Column
						body={(item) => <p>{format(item.created_at)}</p>}
						field="created_at"
						header="Created"></Column>
				</DataTable>
			</div>
		</div>
	);
};

export default Sales;
