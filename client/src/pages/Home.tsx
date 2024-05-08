import { useEffect, useState } from "react";
import UseFetch from "../UseFetch";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

type Sale = {
  id: number;
  item: {
    id: string;
    category?: string;
    created_at: Date;
    updated_at: Date;
    name: string;
    quantity: number;
    price_per_unit: number;
    quantity_sold: number;
    low_stock_threshold: number;
    use_quantity: boolean;
    use_amount: boolean;
    is_service: boolean;
  };
  created_at: Date;
  updated_at: Date;
  price: number;
  quantity: number;
  amount_paid: number;
  status: string;
  payment_method: null;
  total: number;
  change: number;
  sold_by: number;
};

const Home = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [arrangedSalesData, setArrangedSalesData] = useState([]);
  const [expences, setExpences] = useState([]);
  const [arrangedExpencesData, setArrangedExpencesData] = useState([]);
  const [monthlySales, setMonthlySales] = useState<{
    month: null | string;
    data: [];
  }>({ month: null, data: [] });

  const fetchSales = async () => {
    const { data, response } = await UseFetch({
      url: `api/sales_summary`,
      options: {
        method: "GET",
        returnResponse: true,
        useServerUrl: true,
      },
    });
    if (!response.ok) throw new Error("Error fetching sales summary.");
    setSales(data.data);
  };

  const fetchExpences = async () => {
    const { data, response } = await UseFetch({
      url: `api/expences_summary`,
      options: {
        method: "GET",
        returnResponse: true,
        useServerUrl: true,
      },
    });
    if (!response.ok) throw new Error("Error fetching expences summary.");
    setExpences(data.data);
  };

  const arrangeData = () => {
    const cal = {};

    sales.forEach((sale) => {
      if (cal[sale.item.name]) {
        cal[sale.item.name].amount_paid += sale.amount_paid;
        cal[sale.item.name].total += sale.total;
        cal[sale.item.name].quantity += sale.quantity;
      } else {
        cal[sale.item.name] = {
          amount_paid: sale.amount_paid,
          total: sale.total,
          quantity: sale.quantity,
        };
      }
    });

    // Convert cal object to an array
    setArrangedSalesData(Object.entries(cal));
  };

  const arrangeExpencesData = () => {
    const cal = {};

    expences.forEach((expence) => {
      if (cal[expence.item.name]) {
        // cal[sale.item.name].amount_paid += sale.amount_paid;
        cal[expence.item.name].total += expence.total;
        cal[expence.item.name].quantity += expence.quantity;
        // cal[expence.item.name].price_per_unit += expence.price_per_unit;
      } else {
        cal[expence.item.name] = {
          total: expence.total,
          quantity: expence.quantity,
          // price_per_unit: expence.price_per_unit,
        };
      }
    });

    setArrangedExpencesData(Object.entries(cal));
  };

  const fetchMonthlySales = async () => {
    const month = "";
    const { data, response } = await UseFetch({
      url: `api/sales?date=2024-02-01&end-data=2024-02-29`,
      options: {
        method: "GET",
        returnResponse: true,
        useServerUrl: true,
      },
    });
    if (!response.ok) throw new Error("Error fetching monthly sales.");
    // console.log(data.data);
    setMonthlySales(() => ({ month, data: data.data }));
  };

  const arrange = (data) => {
    const response = {};
    console.log(data);
    data.forEach((entry) => {
      console.log(entry.item.name);
      // if (response.hasOwnProperty(entry.item.name.toLowerCase())) {
      //     response[entry.item.name.toLowerCase()] = 2;
      //   } else {
      //     response[entry.item.name.toLowerCase()] = 1;
      //   }
    });
    // data.forEach((entry) => {
    //   if (response.hasOwnProperty(entry.item.name)) {
    //     console.log(1);
    //     response[entry.item.name] = {
    //       quantity: response[entry.item.name].quantity + entry.quantity,
    //       total: response[entry.item.name].total + entry.total,
    //     };
    //   } else {
    //     response[entry.item.name] = {
    //       quantity: entry.quantity,
    //       total: entry.total,
    //     };
    //   }
    // });

    console.log(response);
  };

  arrange(monthlySales.data);

  useEffect(() => {
    (async () => {
      await fetchSales();
      await fetchExpences();
      // await fetchMonthlySales();
    })();
  }, []);

  useEffect(() => {
    arrangeData();
    arrangeExpencesData();
  }, [sales]);

  return (
    <main className="w-full overflow-y-auto">
      <h1 className="text-2xl font-semibold">Home</h1>

      <div className="h-[screen] relative overflow-auto flex flex-row gap-6 px-16 mt-12 flex-wrap">
        <div className="w-full flex-1">
          <DataTable
            value={arrangedSalesData}
            stateStorage="session"
            header={() => (
              <div>
                <h3 className="text-3xl text-blue-500">Sales</h3>
              </div>
            )}
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
            rowsPerPageOptions={[10, 25, 50, 100]}
            className="h-full"
            tableStyle={{}}
          >
            <Column
              field="0"
              body={(item) => (
                <a href={`/summary/${item[0]}`} className="capitalize">
                  {item[0]}
                </a>
              )}
              sortable
              header="Name"
            ></Column>
            <Column field="1.quantity" sortable header="Quantity"></Column>
            <Column field="1.total" sortable header="Total"></Column>
            {/* <Column field="1.amount_paid" sortable header="Amount Paid"></Column>
          <Column
            body={(item) => {
              const difference = item[1].amount_paid - item[1].total;
              return difference === 0 ? "-" : difference;
            }}
            header="Difference"
          ></Column> */}
          </DataTable>
        </div>
        <div className="w-full flex-1">
          <DataTable
            value={arrangedExpencesData}
            stateStorage="session"
            // alwaysShowPaginator={false}
            stripedRows
            // paginatorClassName="absolute bottom-0 left-0 right-0"
            header={() => (
              <div>
                <h3 className="text-3xl text-blue-500">Expences</h3>
              </div>
            )}
            paginator
            rows={10}
            checkIcon
            sortMode="multiple"
            removableSort
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
            rowsPerPageOptions={[10, 25, 50, 100, 200, 300]}
            className="h-full"
            tableStyle={{}}
          >
            <Column
              field="0"
              body={(item) => (
                <a href={`/summary/${item[0]}`} className="capitalize">
                  {item[0]}
                </a>
              )}
              sortable
              header="Name"
            ></Column>
            <Column field="1.quantity" sortable header="Quantity"></Column>
            <Column field="1.total" sortable header="Total"></Column>
          </DataTable>
        </div>
      </div>

      <div></div>
    </main>
  );
};

export default Home;
