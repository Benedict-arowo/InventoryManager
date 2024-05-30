import { useEffect, useRef, useState } from "react";
import { InventoryItems } from "../types";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { SERVER_URL } from "../utils";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { ToggleButton } from "primereact/togglebutton";
import { SelectButton } from "primereact/selectbutton";
import UseFetch from "../UseFetch";
import { Toast } from "primereact/toast";

type NewItemData = {
  name: string;
  category: {
    name?: string;
    code?: string;
  };
  price_per_unit: number;
  low_stock_threshold: number;
  is_service: boolean;
  type: string;
};

const CategoryOptions = [
  { name: "Food", code: "FOOD" },
  { name: "Beer", code: "BEER" },
  { name: "Drinks", code: "DRINKS" },
];

const defaultNewItemData = {
  name: "",
  category: {
    name: undefined,
    code: undefined,
  },
  price_per_unit: 0,
  low_stock_threshold: 0,
  is_service: false,
  type: "QUANTITY",
};

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItems[]>([]);
  const [openNewItemModal, setOpenNewItemModal] = useState(false);
  const [search, setSearch] = useState({
    name: "",
    code: undefined,
  });
  const [openEditItemModal, setOpenEditItemModal] = useState(false);
  const toast = useRef<Toast>(null);

  const [editInventoryItem, setEditInventoryItem] = useState({
    name: "",
    price_per_unit: 0,
    low_stock_threshold: 0,
    category: {
      name: undefined,
      code: undefined,
    },
  });

  const [newItemData, setNewItemData] =
    useState<NewItemData>(defaultNewItemData);

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

  const CreateItem = async () => {
    const { data, response } = await UseFetch({
      url: `api/stock`,
      options: {
        method: "POST",
        useServerUrl: true,
        returnResponse: true,
        body: {
          name: newItemData.name,
          category: newItemData.category.code,
          price_per_unit: newItemData.price_per_unit,
          low_stock_threshold: newItemData.low_stock_threshold,
          is_service: newItemData.is_service,
          type: newItemData.type,
        },
      },
    });

    if (!response.ok)
      return toast.current?.show({
        severity: "error",
        summary: "ERROR",
        detail: data.error
          ? data.error
          : "Error trying to communicate with server.",
      });

    // Add new item to the top of the inventory items array.
    setInventoryItems((prev) => [data.data, ...prev]);
    setNewItemData(() => defaultNewItemData);
    setOpenNewItemModal(false);
  };

  const SaveChanges = async () => {};

  const DeleteItem = async (itemId: string) => {
    const { data, response } = await UseFetch({
      url: `api/stock/${itemId}`,
      options: {
        method: "DELETE",
        useServerUrl: true,
        returnResponse: true,
      },
    });

    if (!response.ok)
      return toast.current?.show({
        severity: "error",
        summary: "ERROR",
        detail: data.error
          ? data.error
          : "Error trying to communicate with server.",
      });

    // Removing the item from the local state after successfull deletion
    setInventoryItems((prev) =>
      prev.filter((item) => {
        return item.id !== itemId;
      })
    );

    toast.current?.show({
      severity: "success",
      summary: "SUCCESS",
      detail: "Successfully deleted item.",
    });
  };

  const getInventoryItems = () => {
    return inventoryItems.filter((item) => {
      return item.name.toLowerCase().includes(search.name.toLowerCase());
    });
  };

  const EditItem = (id: string) => {
    const item = inventoryItems.find((item) => item.id === id);
    if (!item) return;

    let categoryCode = CategoryOptions.find(
      (option) => option.code == item.category.name
    );

    setOpenEditItemModal(true);
    setEditInventoryItem(() => {
      return {
        name: item.name,
        price_per_unit: item.price_per_unit,
        low_stock_threshold: item.low_stock_threshold,
        category: {
          name:
            item.category.name[0].toUpperCase() +
            item.category.name.slice(1).toLowerCase(),
          code: item.category.name.toUpperCase(),
        },
      };
    });
  };

  return (
    <main className="sm:p-4 px-2 py-4 w-full relative">
      <Toast ref={toast} />
      <button
        className="absolute z-10 bottom-3 right-3 cursor-pointer"
        onClick={() => setOpenNewItemModal(() => true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-12 h-12 text-blue-400"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <header className="grid place-items-center w-full">
        <Dropdown
          value={search.name}
          onChange={(e) =>
            setSearch(() => ({
              code: e.value.code && e.value.code,
              name: e.value.name ? e.value.name : e.value,
            }))
          }
          options={inventoryItems.map((item) => ({
            // Captializes the first letter of the item name since they're usually small case'd.
            name: item.name[0].toUpperCase() + item.name.slice(1),
            code: item.id,
          }))}
          optionLabel="name"
          editable
          placeholder="Search"
          className="w-full md:w-14rem max-w-[500px]"
        />
      </header>

      <div className="h-full w-full mt-4 overflow-auto max-h-[90%]">
        <DataTable
          value={getInventoryItems()}
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
          className="h-full sm:px-4"
          tableStyle={{}}
        >
          <Column
            body={(item) => (
              <a href={`/summary/${item.name}`} className="capitalize">
                {item.name}
              </a>
            )}
            field="name"
            header="Name"
            sortable
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
                {item.category ? item.category.name : "NULL"}
              </p>
            )}
            sortable
            field="category.name"
            header="Category"
          ></Column>
          <Column body={statusBodyTemplate} header="Status"></Column>
          <Column
            body={(item) => (
              <div className="flex flex-row gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-slate-500 cursor-pointer"
                  onClick={() => DeleteItem(item.id)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                  onClick={() => EditItem(item.id)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header="New item"
        visible={openNewItemModal}
        draggable={false}
        style={{ width: "50vw" }}
        dismissableMask
        onHide={() => setOpenNewItemModal(false)}
      >
        <section>
          <h3 className="font-bold text-sm">Info</h3>
          <div className="px-2 flex flex-col gap-2 mt-2">
            <span className="flex flex-row gap-2 items-center">
              <label
                htmlFor="item_name"
                className="font-bold text-sm text-center border-1 border-zinc-300"
              >
                Name:
              </label>
              <InputText
                id="item_name"
                placeholder="Item Name"
                value={newItemData.name}
                className="w-full border p-2"
                onChange={(e) =>
                  setNewItemData((prev) => {
                    return {
                      ...prev,
                      name: e.target.value,
                    };
                  })
                }
              />
            </span>

            <span className="flex flex-row gap-2 items-center">
              <label
                htmlFor="item_category"
                className="font-bold text-sm text-center border-1 border-zinc-300"
              >
                Category:
              </label>
              <Dropdown
                value={newItemData.category}
                onChange={(e) =>
                  setNewItemData((props) => ({ ...props, category: e.value }))
                }
                options={CategoryOptions}
                optionLabel="name"
                placeholder="Select a Category"
                className="w-full md:w-14rem"
              />
            </span>
          </div>
        </section>

        <section className="mt-2">
          <h3 className="font-bold text-sm">Extras</h3>
          <div className="px-2 flex flex-col gap-2 mt-2">
            <span className="flex flex-row gap-2 items-center">
              <label
                htmlFor="item_threshold"
                className="font-bold text-sm text-center border-1 min-w-fit border-zinc-300"
              >
                Low Stock Threshold:
              </label>
              <InputNumber
                id="item_threshold"
                value={newItemData.low_stock_threshold}
                onValueChange={(e) =>
                  setNewItemData((props) => ({
                    ...props,
                    low_stock_threshold: Number(e.value),
                  }))
                }
                min={0}
              />
            </span>

            <span className="flex flex-row gap-2 items-center">
              <label
                htmlFor="item_is_service"
                className="font-bold text-sm text-center border-1 min-w-fit border-zinc-300"
              >
                Is service:
              </label>
              <ToggleButton
                checked={newItemData.is_service}
                onChange={(e) =>
                  setNewItemData((props) => ({
                    ...props,
                    is_service: e.value,
                  }))
                }
              />
            </span>

            {!newItemData.is_service && (
              <span className="flex flex-row gap-2 items-center">
                <label
                  htmlFor="item_type"
                  className="font-bold text-sm text-center border-1 min-w-fit border-zinc-300"
                >
                  Type:
                </label>
                <SelectButton
                  value={newItemData.type}
                  onChange={(e) =>
                    setNewItemData((props) => ({
                      ...props,
                      type: e.value,
                    }))
                  }
                  options={["AMOUNT", "QUANTITY"]}
                />
              </span>
            )}
          </div>
        </section>

        <footer className="flex w-full flex-row justify-center mt-4">
          <Button onClick={CreateItem}>Create</Button>
        </footer>
      </Dialog>

      {/* EDIT DIALOG */}

      <Dialog
        header={`Editing Item - ${editInventoryItem.name}`}
        visible={openEditItemModal}
        draggable={false}
        style={{ width: "50vw" }}
        dismissableMask
        onHide={() => setOpenEditItemModal(false)}
      >
        <section>
          <h3 className="font-bold text-sm">Info</h3>
          <div className="px-2 flex flex-col gap-2 mt-2">
            <span className="flex flex-row gap-2 items-center">
              <label
                htmlFor="item_name"
                className="font-bold text-sm text-center border-1 border-zinc-300"
              >
                Name:
              </label>
              <InputText
                id="item_name"
                placeholder="Item Name"
                value={editInventoryItem.name}
                className="w-full border p-2 capitalize"
                onChange={(e) =>
                  setEditInventoryItem((prev) => {
                    return {
                      ...prev,
                      name: e.target.value,
                    };
                  })
                }
              />
            </span>

            <span className="flex flex-row gap-2 items-center">
              <label
                htmlFor="item_category"
                className="font-bold text-sm text-center border-1 border-zinc-300"
              >
                Category:
              </label>
              <Dropdown
                value={editInventoryItem.category}
                onChange={(e) =>
                  setEditInventoryItem((props) => ({
                    ...props,
                    category: e.value,
                  }))
                }
                options={CategoryOptions}
                optionLabel="name"
                placeholder="Select a Category"
                className="w-full md:w-14rem"
              />
            </span>
          </div>
        </section>

        <section className="mt-2">
          <h3 className="font-bold text-sm">Extras</h3>
          <div className="px-2 flex flex-col gap-2 mt-2">
            <span className="flex flex-row gap-2 items-center">
              <label
                htmlFor="item_threshold"
                className="font-bold text-sm text-center border-1 min-w-fit border-zinc-300"
              >
                Low Stock Threshold:
              </label>
              <InputNumber
                id="item_threshold"
                value={editInventoryItem.low_stock_threshold}
                onValueChange={(e) =>
                  setEditInventoryItem((props) => ({
                    ...props,
                    low_stock_threshold: Number(e.value),
                  }))
                }
                min={0}
              />
            </span>
          </div>
        </section>

        <footer className="flex w-full flex-row justify-center mt-4">
          <Button onClick={SaveChanges}>Save Changes</Button>
        </footer>
      </Dialog>
    </main>
  );
};

export default Inventory;
