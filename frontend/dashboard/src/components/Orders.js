import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Styles/Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://investaflow.onrender.com/getOrders")
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="orders">
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders today</p>
          <Link to="/" className="btn">
            Get started
          </Link>
        </div>
      ) : (
        <div className="order-list">
          <h2>Your Orders</h2>
          <ul>
            {orders.map((order, index) => (
              <li key={index} className="order-card">
                <strong>{order.name}</strong> ({order.mode})<br />
                Qty: {order.qty}, Price: ₹{order.price} <br />
                <small>{new Date(order.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Orders;