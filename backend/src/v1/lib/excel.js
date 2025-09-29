import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateInvoiceExcel(invoiceData) {
  const templatePath = path.join(__dirname, "template.html");
  let html = fs.readFileSync(templatePath, "utf8");

  // Replace image paths with Supabase URLs (assuming online hosting)
  html = html.replace(
    /src="\.\//g,
    'src="https://jegdjcrxqqxzcmboiblb.supabase.co/storage/v1/object/public/test/'
  );

  // Generate table rows
  let itemsTable = invoiceData.items
    .map(
      (item, index) => `
      <tr class="${index % 2 === 0 ? "highlight-row" : ""}">
        <td>${item.slNo}</td>
        <td>${item.description}</td>
        <td>${item.hsn}</td>
        <td>${item.qty}</td>
        <td>${item.unit}</td>
        <td>${item.projectValue}</td>
        <td class="total-col">${item.totalAmount}</td>
      </tr>
      `
    )
    .join("");

  // Add empty rows if less than 5 items
  if (invoiceData.items.length < 5) {
    itemsTable += Array.from({ length: 5 - invoiceData.items.length })
      .map(
        () => `
        <tr>
          <td>&nbsp;</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        `
      )
      .join("");
  }

  // Replace placeholders
  const replacements = { ...invoiceData, itemsTable };
  Object.entries(replacements).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  });

  // Return HTML as a buffer
  return Buffer.from(html, "utf-8");
}

// const today = "26-Sep-2025";
// const tempInvoice = {
//   // Top Section
//   invoiceReference: "INV-2025-001",
//   paymentApplicationNo: "PA-0092",
//   paymentApplicationDate: "2025-08-15",
//   invoiceDate: "2025-08-31",
//   quotationRef: "PO-FR-2505220",
//   quotationRefDate: "2025-08-10",

//   // Business Information Section
//   lineOfBusiness: "Engineering and Services",
//   stateCountryOfOrigin: "Kerala, India",
//   countryOfConsignee: "United Arab Emirates",
//   modeOfMaterialTransport: "Engineering Deliverable, Via E-Mail",

//   // Client / Billing Section
//   clientName: "ABC Engineering LLC",
//   clientAddress1: "Downtown Business Center",
//   clientAddress2: "Dubai, P.O.Box 234674, UAE",
//   clientEmail: "client@example.com",
//   clientGSTN: "GSTN123456789",

//   // Project Section
//   projectNo: "PRJ-7720",
//   projectName: "NFPS Offshore Development",

//   // Totals Section
//   netTotal: "USD 2,169.00",
//   cgst: "USD 0.00",
//   sgst: "USD 0.00",
//   igst: "USD 0.00",
//   grandTotal: "USD 2,169.00",
//   totalInWords: "Two Thousand One Hundred Sixty-Nine US Dollars",

//   // Dynamic Items Table
//   items: [
//     {
//       slNo: 1,
//       description:
//         "it",
//       hsn: "998323",
//       qty: "4.07%",
//       unit: "%",
//       projectValue: "USD 47,500.00",
//       totalAmount: "USD 1,934.00",
//     },
//     {
//       slNo: 2,
//       description: "Service Charge for Engineering Support",
//       hsn: "998323",
//       qty: "12.50%",
//       unit: "%",
//       projectValue: "USD 1,880.00",
//       totalAmount: "USD 235.00",
//     },
//   ],
// };
// generateInvoiceExcel(tempInvoice);
