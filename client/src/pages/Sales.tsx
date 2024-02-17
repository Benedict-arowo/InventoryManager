import { useEffect, useState } from "react";
import { SERVER_URL } from "../utils";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { format } from "timeago.js";
import { BreadCrumb } from "primereact/breadcrumb";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { Calendar } from "primereact/calendar";
import { CascadeSelect } from "primereact/cascadeselect";
import { AutoComplete } from "primereact/autocomplete";
import dateFormat from "dateformat";

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
      <p className="text-sm font-light px-4 py-1">{item.payment_method}</p>
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
        severity={getSeverity(item)}
      ></Tag>
    );
  };

  useEffect(() => {
    fetch(`${SERVER_URL}/api/sales?date=2024-02-17`, { method: "GET" })
      .then((res) => res.json())
      .then((data) => setSalesItems(data.data))
      .catch((err) => console.log(err));
  }, []);

  const items = [{ label: "Dashboard" }, { label: "Sales" }];

  const demoItems = ["one", "two", "three"];

  const countries = [
    {
      name: "Australia",
      code: "AU",
      states: [
        {
          name: "New South Wales",
          cities: [
            { cname: "Sydney", code: "A-SY" },
            { cname: "Newcastle", code: "A-NE" },
            { cname: "Wollongong", code: "A-WO" },
          ],
        },
        {
          name: "Queensland",
          cities: [
            { cname: "Brisbane", code: "A-BR" },
            { cname: "Townsville", code: "A-TO" },
          ],
        },
      ],
    },
    {
      name: "Canada",
      code: "CA",
      states: [
        {
          name: "Quebec",
          cities: [
            { cname: "Montreal", code: "C-MO" },
            { cname: "Quebec City", code: "C-QU" },
          ],
        },
        {
          name: "Ontario",
          cities: [
            { cname: "Ottawa", code: "C-OT" },
            { cname: "Toronto", code: "C-TO" },
          ],
        },
      ],
    },
    {
      name: "United States",
      code: "US",
      states: [
        {
          name: "California",
          cities: [
            { cname: "Los Angeles", code: "US-LA" },
            { cname: "San Diego", code: "US-SD" },
            { cname: "San Francisco", code: "US-SF" },
          ],
        },
        {
          name: "Florida",
          cities: [
            { cname: "Jacksonville", code: "US-JA" },
            { cname: "Miami", code: "US-MI" },
            { cname: "Tampa", code: "US-TA" },
            { cname: "Orlando", code: "US-OR" },
          ],
        },
        {
          name: "Texas",
          cities: [
            { cname: "Austin", code: "US-AU" },
            { cname: "Dallas", code: "US-DA" },
            { cname: "Houston", code: "US-HO" },
          ],
        },
      ],
    },
  ];
  const home = { icon: "pi pi-home", url: "." };

  return (
    <div className="w-full relative text-zinc-700">
      <BreadCrumb className="bg-transparent mt-1" model={items} home={home} />
      <div className="px-8">
        <header className="flex flex-row justify-between gap-4 mt-4 py-2 px-2">
          <h1 className="font-bold text-5xl text-zinc-800">Sales</h1>
          <Button
            icon="pi pi-download"
            className="h-fit"
            label="Download PDF"
          ></Button>
        </header>

        <section className="my-6 flex flex-row gap-4 items-center">
          {/* <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText placeholder="Search" />
        </span> */}

          <div className="flex flex-col gap-1 flex-1">
            <label
              htmlFor="search_sales"
              className="px-1 text-xs font-semibold"
            >
              Search for sales
            </label>
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText placeholder="Search" className="w-full" />
            </span>
          </div>

          <div className="flex flex-col gap-1 h-fit">
            <label
              htmlFor="search_sales"
              className="px-1 text-xs font-semibold"
            >
              Search By Date
            </label>
            <Calendar
              selectionMode="range"
              // value={date} onChange={(e) => setDate(e.value)}
            />
          </div>

          <div className="flex flex-col gap-1 h-fit">
            <label
              htmlFor="search_sales"
              className="px-1 text-xs font-semibold"
            >
              Filters
            </label>
            <CascadeSelect
              // value={selectedCity}
              // onChange={(e) => setSelectedCity(e.value)}
              options={countries}
              optionLabel="cname"
              optionGroupLabel="name"
              optionGroupChildren={["states", "cities"]}
              className="w-full md:w-14rem"
              breakpoint="767px"
              placeholder="Filter by {current filter...}"
              style={{ minWidth: "14rem" }}
            />
          </div>

          <div className="flex flex-col gap-1 h-fit">
            <label
              htmlFor="search_sales"
              className="px-1 text-xs font-semibold"
            >
              Customer
            </label>
            <AutoComplete
              // value={value}
              suggestions={demoItems}
              // completeMethod={search}
              // onChange={(e) => setValue(e.value)}
              forceSelection
            />
          </div>
        </section>
        <div className="h-[90vh] overflow-auto mt-4">
          <DataTable
            value={salesItems}
            stateStorage="session"
            alwaysShowPaginator={false}
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
            tableStyle={{}}
          >
            <Column
              field="id"
              header="#"
              style={{ width: "32px", fontSize: ".8rem" }}
            ></Column>
            <Column
              body={(item) => <p className="capitalize">{item.item.name}</p>}
              field="item.name"
              header="Name"
            ></Column>
            {/* <Column field="category" header="Category"></Column> */}
            <Column sortable field="quantity" header="Quantity"></Column>
            {/* <Column field="price" header="Price"></Column> */}
            <Column sortable field="amount_paid" header="Amount Paid"></Column>
            <Column sortable body={totalBodyTemplate} header="Total"></Column>
            <Column
              body={statusBodyTemplate}
              sortable
              field="status"
              header="Status"
            ></Column>
            {/* <Column body={paymentBodyTemplate} header="Method"></Column> */}
            <Column
              body={(item) => (
                <p>{dateFormat(new Date(item.created_at), "fullDate")}</p>
              )}
              field="created_at"
              header="Created"
              sortable
            ></Column>
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default Sales;
