import { useEffect, useState } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import UseFetch from "../UseFetch";

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

type Search = {
  name: string | undefined;
  code: string | undefined;
};
const formatDate = (incoming_date: Date) => {
  // YY-MM-DD format

  if (!incoming_date) return;
  const date = new Date(incoming_date);
  return (
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
  );
};

const Sales = () => {
  const [salesItems, setSalesItems] = useState<Sale[]>([]);
  const [search, setSearch] = useState<Search>({
    name: undefined,
    code: undefined,
  });
  const [date, setDate] = useState<Date[] | null>(null);

  const totalBodyTemplate = (item: Sale) => {
    return <p>{item.price * item.quantity}</p>;
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

  const fetchSales = async (date: Date[]) => {
    if (!date) date = [new Date(), new Date()];

    const { data, response } = await UseFetch({
      url: `api/sales?date=${formatDate(date[0])}${
        formatDate(date[1]) !== undefined
          ? "&end-date=" + formatDate(date[1])
          : ""
      }`,
      options: {
        method: "GET",
        returnResponse: true,
        useServerUrl: true,
      },
    });

    if (!response.ok) throw new Error("Error communicating with server.");

    setSalesItems(data.data);
  };

  useEffect(() => {
    (async () => await fetchSales(date ? date : [new Date()]))();
  }, [date]);

  const getSalesItems = () => {
    return salesItems.filter((item) => {
      if (search.name) {
        return (
          item.item.name.toLowerCase().includes(search.name.toLowerCase()) ||
          item.status.toLowerCase() === search.name.toLowerCase() ||
          item.payment_method.toLowerCase() === search.name.toLowerCase() ||
          item.id.toString() == search.name
        );
      }
      return true;
    });
  };

  return (
    <div className="w-full relative p-4">
      <button className="absolute z-10 bottom-3 right-3 cursor-pointer">
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
          options={salesItems.map((item) => ({
            // Captializes the first letter of the item name since they're usually small case'd.
            name: item.item.name[0].toUpperCase() + item.item.name.slice(1),
            code: item.id,
          }))}
          optionLabel="name"
          editable
          placeholder="Search"
          className="w-full md:w-14rem max-w-[500px]"
        />
      </header>

      <section>
        <Calendar
          value={date}
          onChange={(e) => {
            if (
              e.value !== null &&
              e.value !== undefined &&
              e.value[0] &&
              e.value[1]
            ) {
              const date1 = e.value[0];
              const date2 = e.value[1];
              // Convert dates to milliseconds
              const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000; // assuming a month is 30 days
              const timeDiff = Math.abs(date2.getTime() - date1.getTime());

              // Check if the time difference is greater than a month
              if (timeDiff > oneMonthInMillis) {
                // TODO: A toast that popups up saying the difference is too big
                console.log("Too huge");
                return;
              }
            }
            return setDate(e.value);
          }}
          selectionMode="range"
          showButtonBar
          maxDateCount={30}
          readOnlyInput
          showIcon
        />
      </section>

      <div className="h-[90vh] mt-6 overflow-auto">
        <DataTable
          value={getSalesItems()}
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
          tableStyle={{}}
        >
          <Column
            field="id"
            header="#"
            style={{ width: "32px", fontSize: ".8rem" }}
          ></Column>
          <Column field="item.name" header="Name"></Column>
          {/* <Column field="category" header="Category"></Column> */}
          <Column field="quantity" header="Quantity"></Column>
          <Column field="price" header="Price"></Column>
          <Column field="amount_paid" header="Amount Paid"></Column>
          <Column body={totalBodyTemplate} header="Total"></Column>
          <Column body={statusBodyTemplate} header="Status"></Column>
          {/* <Column body={paymentBodyTemplate} header="Method"></Column> */}
          <Column
            body={(item) => <p>{formatDate(item.created_at)}</p>}
            field="created_at"
            header="Created"
          ></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default Sales;
