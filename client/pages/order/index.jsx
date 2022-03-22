import React from "react";

const OrderIndex = ({ orders }) => {
  const ordersList = orders.map((item) => (
    <tr key={item.id}>
      <td>{item.ticket.title}</td>
      <td>{item.ticket.price}</td>
      <td>{item.status}</td>
    </tr>
  ));
  return (
    <div>
      <h1>Orders</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>{ordersList}</tbody>
      </table>
    </div>
  );
};
OrderIndex.getInitialProps = async (context, client, user) => {
  // we ar on server or browser

  const { data } = await client.get(`/api/orders`);
  return { orders: data };
};
export default OrderIndex;
