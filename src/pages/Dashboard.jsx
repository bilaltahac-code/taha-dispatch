import { useState } from "react";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);

  const addOrder = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const order = {
      id: Date.now(),
      name: file.name,
      file: URL.createObjectURL(file),
      truck: "",
    };

    setOrders([...orders, order]);
  };

  return (
    <div className="app">
      <h1>🚛 מערכת סידור משאיות</h1>

      <label className="upload-btn">
        ➕ הוסף הזמנה (PDF)
        <input
          type="file"
          accept="application/pdf"
          hidden
          onChange={addOrder}
        />
      </label>

      <div className="orders">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <h3>{order.name}</h3>

            <select
              value={order.truck}
              onChange={(e) => {
                const newOrders = [...orders];
                const index = newOrders.findIndex(
                  (o) => o.id === order.id
                );
                newOrders[index].truck = e.target.value;
                setOrders(newOrders);
              }}
            >
              <option value="">בחר משאית</option>
              <option>עז</option>
              <option>זבידאת</option>
            </select>

            <br />
            <br />

            <a href={order.file} target="_blank">
              📄 פתח הזמנה
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}