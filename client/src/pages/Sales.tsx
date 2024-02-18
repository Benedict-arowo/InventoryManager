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
import { Dialog } from "primereact/dialog";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputNumber } from "primereact/inputnumber";

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
  const [stock, setStock] = useState<Item[]>([]);
  const [newItemState, setNewItemState] = useState({
    name: "",
    quantity: 0,
    price: 0,
    amount_paid: 0,
    payment_method: "",
    minimum_price: 0,
  });
  const [openNewSaleModal, setOpenNewSaleModal] = useState(false);

  const fetchStock = async () => {
    // let itemData;

    // fetch(`${SERVER_URL}/api/stock`, { method: "GET" })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     itemData = data;
    //   })
    //   .catch((err) => console.log(err));
    const response = await fetch(`${SERVER_URL}/api/stock`, { method: "GET" });
    return await response.json();
  };

  useEffect(() => {
    (async () => {
      const { data } = await fetchStock();
      setStock(data);
    })();
  }, []);

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

  const paymentMethods = [
    { name: "CASH", code: "cash" },
    { name: "TRANSFER", code: "transfer" },
    { name: "CARD", code: "card" },
    { name: "NONE", code: "none" },
  ];

  const resetNewItemState = () => {
    setNewItemState(() => {
      return {
        name: "",
        quantity: 0,
        price: 0,
        amount_paid: 0,
        payment_method: "",
      };
    });
  };

  const updateItemBasedOnItemName = (e: string) => {
    const item = stock.find((item) => item.name === e);
    setNewItemState((curr) => {
      return {
        ...curr,
        price: item ? item.price_per_unit : 0,
        minimum_price: item ? item.price_per_unit : 0,
      };
    });
  };

  const createSale = () => {
    if (!newItemState.name) return alert("Please select an item to sell");
    if (newItemState.quantity < 1)
      return alert("Quantity must be greater than 0");
    if (newItemState.price < 1) return alert("Price must be greater than 0");
    if (!newItemState.payment_method)
      return alert("Please select a payment method");

    fetch(`${SERVER_URL}/api/sales/`, {
      method: "POST",
      body: JSON.stringify(newItemState),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return console.error(data.error);
        setSalesItems((curr) => [...curr, data.data]);
        resetNewItemState();
        setOpenNewSaleModal(false);
      })
      .catch((err) => console.log(err));
  };

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
              style={{ width: "32px", fontSize: ".9rem" }}
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

      <Dialog
        header="Create a new sale..."
        visible={openNewSaleModal}
        draggable={false}
        dismissableMask
        style={{ width: "50vw" }}
        onHide={() => setOpenNewSaleModal(false)}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name">Name</label>
          <AutoComplete
            id="name"
            aria-describedby="item-name"
            suggestions={stock.map((item) => item.name)}
            completeMethod={async () => {
              const { data } = await fetchStock();
              setStock(data);
            }}
            value={newItemState.name}
            onChange={(e) => {
              setNewItemState({ ...newItemState, name: e.target.value });
            }}
            onSelect={(e) => {
              updateItemBasedOnItemName(e.value);
            }}
            forceSelection
          />
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="quantity">Quantity</label>
            <InputText
              value={String(newItemState.quantity)}
              onChange={(e) =>
                setNewItemState({
                  ...newItemState,
                  quantity: Number(e.target.value),
                })
              }
              keyfilter="int"
              id="quantity"
              aria-describedby="item-quantity"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="price">Price</label>
            <InputNumber
              id="price"
              aria-describedby="price-name"
              value={newItemState.price}
              onValueChange={(e) =>
                setNewItemState({
                  ...newItemState,
                  price: e.target.value ? e.target.value : 0,
                })
              }
              min={newItemState.minimum_price}
              useGrouping={false}
            />
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="amount_paid">Amount Paid</label>
            <InputText
              value={String(newItemState.amount_paid)}
              onChange={(e) =>
                setNewItemState({
                  ...newItemState,
                  amount_paid: Number(e.target.value),
                })
              }
              keyfilter="int"
              id="amount_paid"
              aria-describedby="amount-paid"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="payment_method">Payment Method</label>
            <Dropdown
              value={newItemState.payment_method}
              onChange={(e) =>
                setNewItemState({ ...newItemState, payment_method: e.value })
              }
              options={paymentMethods}
              id="payment_method"
              aria-describedby="payment-method"
              optionLabel="name"
              placeholder="Select a payment method"
              className="w-full md:w-14rem"
            />
          </div>
        </div>
        <div className="flex flex-row gap-4 justify-center mt-4">
          <Button
            label="Create"
            severity="success"
            className="w-fit h-fit px-6"
            onClick={createSale}
          />
          <Button
            label="Cancel"
            severity="danger"
            className="w-fit h-fit px-6"
            onClick={() => {
              resetNewItemState();
              setOpenNewSaleModal(false);
            }}
          />
        </div>
      </Dialog>

      {/* Add Icon */}
      <Fab
        color="primary"
        aria-label="add"
        size="medium"
        onClick={() => setOpenNewSaleModal(() => true)}
        sx={{
          position: "absolute",
          bottom: 16,
          right: 32,
        }}
      >
        <AddIcon />
      </Fab>
    </div>
  );
};

export default Sales;
