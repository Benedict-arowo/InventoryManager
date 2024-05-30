import React, { useEffect, useState } from "react";
import UseFetch from "../UseFetch";
import { formatDate } from "./Sales";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";

const today = new Date();
const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

const Purchases = () => {
  const [date, setDate] = useState<Date[] | null>([oneWeekAgo, today]);
  const [expences, setExpences] = useState([]);
  const [search, setSearch] = useState({ name: undefined, code: undefined });

  const fetchExpences = async (date: Date[]) => {
    if (!date) date = [new Date(), new Date()];

    const { data, response } = await UseFetch({
      url: `api/expences?date=${formatDate(date[0])}${
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

    if (!response.ok)
      throw new Error("Error trying to communicate with server.");

    setExpences(data.data);
  };

  useEffect(() => {
    (async () => await fetchExpences(date ? date : [new Date()]))();
  }, [date]);

  const getExpenceItems = () => {
    return expences.filter((item) => {
      if (search.name) {
        return (
          item.item.name.toLowerCase().includes(search.name.toLowerCase()) ||
          item.id.toString() == search.name
        );
      }
      return true;
    });
  };

  const getTotal = () => {
    const total = expences.reduce((acc, item) => {
      return acc + item.price_per_unit * item.quantity;
    }, 0);

    return total;
  };

  return (
    <div className="w-full">
      <p>Purchases {expences.length}</p>

      <header className="grid place-items-center w-full">
        <Dropdown
          value={search.name}
          onChange={(e) =>
            setSearch(() => ({
              code: e.value.code && e.value.code,
              name: e.value.name ? e.value.name : e.value,
            }))
          }
          options={expences.map((item) => ({
            // Captializes the first letter of the item name since they're usually small case'd.
            name:
              item.item &&
              item.item.name[0].toUpperCase() + item.item.name.slice(1),
            code: item.id,
          }))}
          optionLabel="name"
          editable
          placeholder="Search"
          className="w-full md:w-14rem max-w-[500px]"
        />
      </header>

      <section className="flex flex-row justify-between px-8">
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
        <p>{getTotal()}</p>
      </section>

      <div className="h-[80vh] relative mt-6 overflow-auto">
        <DataTable
          value={getExpenceItems()}
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
          resizableColumns={true}
          onRowClick={(e) => {
            const target = e.originalEvent.target.parentElement;
            if (target.classList.contains("bg-red-300")) {
              target.classList.remove("bg-red-300");
            } else {
              target.classList.add("bg-red-300");
            }
          }}
        >
          <Column
            field="id"
            header="#"
            style={{ width: "32px", fontSize: ".8rem" }}
          ></Column>
          <Column field="item.name" header="Name" sortable></Column>
          {/* <Column field="category" header="Category"></Column> */}
          <Column sortable field="quantity" header="Quantity"></Column>
          <Column sortable field="price_per_unit" header="Price"></Column>
          <Column sortable field="total" header="Total"></Column>
          {/* <Column body={totalBodyTemplate} header="Total"></Column> */}
          {/* <Column body={statusBodyTemplate} header="Status"></Column> */}
          {/* <Column body={paymentBodyTemplate} header="Method"></Column> */}
          <Column
            body={(item) => <p>{formatDate(item.created_at)}</p>}
            field="created_at"
            header="Created"
            sortable
          ></Column>
        </DataTable>
        s
      </div>
    </div>
  );
};

export default Purchases;
