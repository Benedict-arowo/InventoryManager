import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UseFetch from "../UseFetch";
import Sales, { formatDate } from "./Sales";

const Summary = () => {
  const { id } = useParams();
  const [sales, setSales] = useState([]);
  const [expences, setExpences] = useState([]);
  const [info, setInfo] = useState({
    totalSold: 0,
    totalBought: 0,
  });

  const fetchSales = async () => {
    const { data, response } = await UseFetch({
      url: `api/sale_summary/${id}`,
      options: {
        method: "GET",
        returnResponse: true,
        useServerUrl: true,
      },
    });

    if (!response.ok) throw new Error("Error fetching data from server.");

    setInfo((prev) => {
      return {
        ...prev,
        totalSold: data.data.reduce((acc, item) => acc + item.total, 0),
      };
    });
    setSales(data.data);
    // console.log(data);
  };

  const fetchExpences = async () => {
    const { data, response } = await UseFetch({
      url: `api/expence_summary/${id}`,
      options: {
        method: "GET",
        returnResponse: true,
        useServerUrl: true,
      },
    });

    if (!response.ok) throw new Error("Error fetching data from server.");
    setInfo((prev) => {
      return {
        ...prev,
        totalBought: data.data.reduce((acc, item) => acc + item.total, 0),
      };
    });

    setExpences(data.data);
    // console.log(data);
  };

  useEffect(() => {
    (async () => {
      await fetchSales();
      await fetchExpences();
    })();
  }, []);

  return (
    <div className="w-full">
      {sales.length === 0 &&
        expences.length === 0 &&
        `No entries for this item. ${id}`}
      {(sales.length > 0 || expences.length > 0) && (
        <main className="overflow-auto h-screen w-full mb-4">
          {sales.length > 0 && (
            <div className="text-2xl font-extrabold w-full flex flex-col items-center">
              <h1 className="capitalize">{sales[0].item.name}</h1>
              <p>Price per unit: {sales[0].item.price_per_unit}</p>
            </div>
          )}

          <h3>Amount Sales Found: {sales && sales.length}</h3>
          <h3>Amount Expences Found: {expences && expences.length}</h3>

          <h3>
            Total Sold: {sales.reduce((acc, item) => acc + item.amount_paid, 0)}
          </h3>
          <h3>Total Bought: {info.totalBought}</h3>

          <h3 className="mt-2">
            Total Quantity Bought:{" "}
            {expences.reduce((acc, item) => acc + item.quantity, 0)}
          </h3>
          <h3>
            Total Quantity Sold:{" "}
            {sales.reduce((acc, item) => acc + item.quantity, 0)}
          </h3>

          <h4>Profit: {info.totalSold - info.totalBought}</h4>

          <div className="">
            <h4 className="font-bold text-2xl px-4">Sales</h4>
            {sales.map((sale) => {
              return (
                <div className="flex flex-row justify-evenly font-medium gap-4">
                  <p>Price: {sale.price}</p>
                  <p>Quantity: {sale.quantity}</p>
                  <p>Total: {sale.total}</p>
                  <p>Amount Paid: {sale.amount_paid}</p>
                  <p>Date: {formatDate(sale.created_at)}</p>
                </div>
              );
            })}
          </div>

          <div className="">
            <h4 className="font-bold text-2xl px-4">Expences</h4>
            {expences.map((expence) => {
              return (
                <div className="flex flex-row justify-evenly font-medium gap-4">
                  <p>Price: {expence.price_per_unit}</p>
                  <p>Quantity: {expence.quantity}</p>
                  <p>Total: {expence.total}</p>
                  <p>Date: {formatDate(expence.created_at)}</p>
                </div>
              );
            })}
          </div>
        </main>
      )}
    </div>
  );
};

export default Summary;
