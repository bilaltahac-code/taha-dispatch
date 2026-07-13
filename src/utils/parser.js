export function parseOrder(text) {
  console.log(text);

  let customer = "לא נמצא";
  let orderNumber = "לא נמצא";

  // מספר הזמנה
  const orderMatch = text.match(/מספר\s*:?\s*([0-9/]+)/);

  if (orderMatch) {
    orderNumber = orderMatch[1];
  }

  // ריווחית
  const customerMatch = text.match(
    /מספרכם:\s*\d+\s+(.+?)\s+העתק נאמן למקור/s
  );

  if (customerMatch) {
    customer = customerMatch[1].trim();
  }

  // הזמנת רכש
  const supplierMatch = text.match(/הופק.*?:\s*(.+?)\s+באמצעות/s);

  if (supplierMatch) {
    customer = supplierMatch[1].trim();
  }

  return {
    customer,
    orderNumber,
  };
}