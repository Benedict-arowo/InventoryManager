import { useEffect, useState } from "react";
import UseFetch from "../UseFetch";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";

const MonthlySummary = () => {
  const [summary, setSummary] = useState({
    data: [],
    sortedSummary: [],
    totalSales: 0,
    debt: 0,
    cash: 0,
    totalExpences: 0,
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [status, setStatus] = useState({
    isLoading: true,
    err: null,
  });

  const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  const [date, setDate] = useState<Date>(new Date());

  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  const fetchExpences = async ({ year, month, lastDayOfMonth }) => {
    const { data, response } = await UseFetch({
      url: `api/expences?date=${year}-${month}-01&end-date=${year}-${month}-${lastDayOfMonth.getDate()}`,
      options: {
        method: "GET",
        returnResponse: true,
        useServerUrl: true,
      },
    });
    if (!response.ok) throw new Error("Error fetching monthly sales.");

    return { data };
  };

  const fetchSales = async ({ year, month, lastDayOfMonth }) => {
    const { data, response } = await UseFetch({
      url: `api/sales?date=${year}-${month}-01&end-date=${year}-${month}-${lastDayOfMonth.getDate()}`,
      options: {
        method: "GET",
        returnResponse: true,
        useServerUrl: true,
      },
    });
    if (!response.ok) throw new Error("Error fetching monthly sales.");

    return { data };
  };
  const fetchSummary = async () => {
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const year = date.getFullYear();
    const month =
      date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;

    const {
      data: { data: expencesData },
    } = await fetchExpences({ year, month, lastDayOfMonth });

    const {
      data: { data: salesData },
    } = await fetchSales({ year, month, lastDayOfMonth });

    const { data: sortedData, total: totalSales } = sortItem({
      item: salesData,
      mode: "sales",
    });

    const { data: sortedDataExpences, total: totalExpences } = sortItem({
      alreadySorted: sortedData,
      item: expencesData,
      mode: "expences",
    });

    // console.log(sortedData);
    console.log(sortedDataExpences);
    const debt = 0;
    const cash = 0;
    setSummary(() => ({
      data: salesData,
      sortedSummary: Object.entries(sortedDataExpences),
      totalSales,
      totalExpences,
      debt,
      cash,
    }));
  };

  const sortItem = ({ alreadySorted = {}, item, mode }) => {
    const sortedItems = { ...alreadySorted };
    let total = 0;

    item.forEach((item) => {
      if (sortedItems.hasOwnProperty(item.item.name)) {
        if (mode == "sales") {
          sortedItems[item.item.name] = {
            ...sortedItems[item.item.name],
            quantitySold:
              sortedItems[item.item.name].quantitySold + item.quantity,
            totalSold: sortedItems[item.item.name].totalSold + item.total,
          };
        } else {
          sortedItems[item.item.name] = {
            ...sortedItems[item.item.name],
            quantityBought:
              sortedItems[item.item.name].quantityBought + item.quantity,
            totalBought: sortedItems[item.item.name].totalBought + item.total,
          };
        }
      } else {
        if (mode == "sales") {
          sortedItems[item.item.name] = {
            name: item.item.name,
            quantitySold: item.quantity,
            totalSold: item.total,
            quantityBought: 0,
            totalBought: 0,
          };
        } else {
          sortedItems[item.item.name] = {
            name: item.item.name,
            quantityBought: item.quantity,
            totalBought: item.total,
            quantitySold: 0,
            totalSold: 0,
          };
        }
      }
      total += item.total;
    });

    return { data: sortedItems, total };
    // return { data: Object.entries(sortedItems), total };
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchSummary();
      } catch (error: any) {
        setStatus({ isLoading: false, err: error });
      } finally {
        setStatus((prev) => ({ ...prev, isLoading: false }));
      }
    })();
  }, [date]);
  return (
    <div className="w-screen h-screen">
      <header className="flex flex-row justify-between px-4 pt-3 pb-4">
        <div>
          <p className="font-extralight text-slate-600 text-2xl">
            Currently Viewing
          </p>
          <h1 className="text-xl font-bold text-slate-600">
            {months[date.getMonth()]}
          </h1>
        </div>
        <fieldset className="flex flex-col gap-1  max-w-fit">
          <h3 className="font-medium text-lg px-1">Select Month</h3>
          <Calendar
            value={date}
            onChange={(e) => setDate(e.value)}
            view="month"
            dateFormat="mm/yy"
            maxDate={new Date()}
            minDate={new Date(2023, 8, 1)}
          />
        </fieldset>
      </header>

      <div className="flex flex-row gap-1 mt-4 px-2 h-full">
        <div className="flex-1 mb-2">
          <DataTable
            value={summary.sortedSummary}
            tableStyle={{ minWidth: "50rem" }}
            selectionMode="multiple"
            selection={selectedRows}
            scrollable
            scrollHeight="flex"
            onSelectionChange={(e) => setSelectedRows(e.value)}
          >
            <Column field="0" header="Name" sortable></Column>
            <Column
              field="1.quantityBought"
              header="Quantity Bought"
              sortable
            ></Column>
            <Column
              field="1.quantitySold"
              header="Quantity Sold"
              sortable
            ></Column>
            <Column
              field="1.totalBought"
              header="Amount Bought (N)"
              sortable
            ></Column>
            <Column
              field="1.totalSold"
              header="Amount Sold (N)"
              sortable
            ></Column>
          </DataTable>
        </div>

        <section className="w-[300px] px-3">
          {/* <li>Summary for everything sold</li> */}
          {/* <fieldset className="flex flex-row justify-between items-center">
            <p>Total Cash</p>
            {summary.cash}
          </fieldset> */}
          <fieldset className="flex flex-row justify-between items-center">
            <p>Total Transfer</p>
            {summary.totalSales - summary.debt - summary.cash}
          </fieldset>
          <fieldset className="flex flex-row justify-between items-center">
            <p>Total Sales:</p>
            {summary.totalSales}
          </fieldset>
          <fieldset className="flex flex-row justify-between items-center">
            <p>Total Expences:</p>
            {summary.totalExpences}
          </fieldset>

          <fieldset className="flex flex-row justify-between items-center">
            <p>Profit (Sales - Expences):</p>
            {summary.totalSales - summary.totalExpences}
          </fieldset>
          {summary.debt > 0 && (
            <fieldset className="flex flex-row justify-between items-center">
              <p>Debt:</p>
              {summary.debt}
            </fieldset>
          )}
        </section>
      </div>
    </div>
  );
};

export default MonthlySummary;
