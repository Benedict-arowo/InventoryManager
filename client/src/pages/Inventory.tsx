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
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { SERVER_URL } from "../utils";
import { Dialog } from "primereact/dialog";

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItems[]>([]);
  const [openNewItemModal, setOpenNewItemModal] = useState(false);
  const [search, setSearch] = useState("");

  // TODO: Error catching
  const fetchItems = () => {
    fetch(`${SERVER_URL}/api/stock`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => setInventoryItems(() => data.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // console.log(inventoryItems);
  const statusBodyTemplate = (item: InventoryItems) => {
    const getSeverity = (item: InventoryItems) => {
      if (item.is_service) return "success";
      else if (!item.quantity) return "danger";
      else if (item.quantity > item.low_stock_threshold) return "success";
      else return "warning";
    };

    return (
      <Tag
        value={
          item.is_service
            ? "IN STOCK"
            : !item.quantity
            ? "OUT OF STOCK"
            : item.quantity > item.low_stock_threshold
            ? "IN STOCK"
            : "LOW STOCK"
        }
        severity={getSeverity(item)}
      ></Tag>
    );
  };

  const header = (
    <div className="flex justify-between gap-2">
      <span className="text-xl text-900 font-bold">Items</span>
      <Button icon="pi pi-refresh" rounded raised />
    </div>
  );
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

      <div className="h-[90vh] relative mt-6">
        <DataTable
          value={inventoryItems}
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
            body={(item) => <p className="capitalize">{item.name}</p>}
            field="name"
            header="Name"
          ></Column>
          <Column
            body={(item) => (
              <p
                className={`${
                  item.quantity < item.low_stock_threshold
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {item.quantity}
              </p>
            )}
            field="quantity"
            sortable
            header="Quantity"
          ></Column>

          <Column
            field="quantity_sold"
            sortable
            body={(item) => (
              <p>{item.quantity_sold ? item.quantity_sold : "-"}</p>
            )}
            header="Quantity Sold"
          ></Column>
          <Column
            field="price_per_unit"
            sortable
            body={(item) => (
              <p>{item.price_per_unit ? item.price_per_unit : "-"}</p>
            )}
            header="Price"
          ></Column>
          <Column
            body={(item) => (
              <p className="bg-slate-600 text-white w-fit px-2 py-1 rounded-md text-xs font-medium">
                {item.category}
              </p>
            )}
            field="category"
            header="Category"
          ></Column>
          <Column body={statusBodyTemplate} header="Status"></Column>
        </DataTable>
      </div>

      <Dialog
        header="Create a new item..."
        visible={openNewItemModal}
        draggable={false}
        dismissableMask
        style={{ width: "50vw" }}
        onHide={() => setOpenNewItemModal(false)}
      >
        <p className="m-0">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </Dialog>

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
        }}
      >
        <AddIcon />
      </Fab>
    </main>
  );
};

export default Inventory;
