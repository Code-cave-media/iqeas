// import app from "./src/v1/app.js";
// import dotenv from "dotenv";
// dotenv.config();

// const port = process.env.PORT;
// const base_url = process.env.API_BASE_URL;

// app.get("/", (req, res) => {
//   res.json({ active: "true", status: "200" });
// });

// app.listen(port, () => {
//   console.log(`\x1b[34m[+] Server running on ${port} ==> ${base_url}\x1b[0m`);
// });

import { htmlToPdf } from "./src/v1/lib/excel.js";
import fs from "fs";

const invoiceData = {
  paymentApplicationNo: "PA-2025-001",
  paymentApplicationDate: "2025-08-26",
  invoiceReference: "INV-2025-101",
  invoiceDate: "2025-08-26",
  clientName: "Acme Corporation",
  clientAddress: "123 Main Street, Springfield, IL",
  clientEmail: "accounts@acme.com",
  clientGSTN: "27AAACB1234F1Z5",
  projectNo: "PRJ-2025-01",
  projectName: "New Factory Setup",
  projectValue: 5000000,
  variationAmount: 50000,
  billingPeriod: "August 2025",
  totalTaxAmount: 90000,
  totalPOAmount: 5095000,
  totalInWords: "Fifty Lakh Ninety Five Thousand Only", // ← Add this field
  items: [
    {
      slNo: 1,
      description: "Civil Works",
      previousProgress: "40%",
      receivedAmount: 2000000,
      currentProgress: "10%",
      currentAmount: 500000,
      currentTax: 90000,
    },
    {
      slNo: 2,
      description: "Electrical Works",
      previousProgress: "30%",
      receivedAmount: 1000000,
      currentProgress: "15%",
      currentAmount: 300000,
      currentTax: 54000,
    },
    {
      slNo: 3,
      description: "Plumbing Works",
      previousProgress: "20%",
      receivedAmount: 400000,
      currentProgress: "5%",
      currentAmount: 100000,
      currentTax: 18000,
    },
    {
      slNo: 4,
      description: "HVAC Installation",
      previousProgress: "25%",
      receivedAmount: 600000,
      currentProgress: "10%",
      currentAmount: 200000,
      currentTax: 36000,
    },
    {
      slNo: 5,
      description: "Flooring & Tiling",
      previousProgress: "35%",
      receivedAmount: 800000,
      currentProgress: "20%",
      currentAmount: 250000,
      currentTax: 45000,
    },
    {
      slNo: 6,
      description: "Interior Finishing",
      previousProgress: "15%",
      receivedAmount: 300000,
      currentProgress: "10%",
      currentAmount: 150000,
      currentTax: 27000,
    },
    {
      slNo: 7,
      description: "Painting Works",
      previousProgress: "10%",
      receivedAmount: 200000,
      currentProgress: "15%",
      currentAmount: 120000,
      currentTax: 21600,
    },
    {
      slNo: 8,
      description: "Landscaping",
      previousProgress: "5%",
      receivedAmount: 100000,
      currentProgress: "10%",
      currentAmount: 80000,
      currentTax: 14400,
    },
    {
      slNo: 9,
      description: "Fire Safety Systems",
      previousProgress: "20%",
      receivedAmount: 350000,
      currentProgress: "15%",
      currentAmount: 180000,
      currentTax: 32400,
    },
    {
      slNo: 10,
      description: "Lift & Escalator Installation",
      previousProgress: "0%",
      receivedAmount: 0,
      currentProgress: "25%",
      currentAmount: 500000,
      currentTax: 90000,
    },
    {
      slNo: 1,
      description: "Civil Works",
      previousProgress: "40%",
      receivedAmount: 2000000,
      currentProgress: "10%",
      currentAmount: 500000,
      currentTax: 90000,
    },
    {
      slNo: 2,
      description: "Electrical Works",
      previousProgress: "30%",
      receivedAmount: 1000000,
      currentProgress: "15%",
      currentAmount: 300000,
      currentTax: 54000,
    },
    {
      slNo: 3,
      description: "Plumbing Works",
      previousProgress: "20%",
      receivedAmount: 400000,
      currentProgress: "5%",
      currentAmount: 100000,
      currentTax: 18000,
    },
    {
      slNo: 4,
      description: "HVAC Installation",
      previousProgress: "25%",
      receivedAmount: 600000,
      currentProgress: "10%",
      currentAmount: 200000,
      currentTax: 36000,
    },
    {
      slNo: 5,
      description: "Flooring & Tiling",
      previousProgress: "35%",
      receivedAmount: 800000,
      currentProgress: "20%",
      currentAmount: 250000,
      currentTax: 45000,
    },
    {
      slNo: 6,
      description: "Interior Finishing",
      previousProgress: "15%",
      receivedAmount: 300000,
      currentProgress: "10%",
      currentAmount: 150000,
      currentTax: 27000,
    },
    {
      slNo: 7,
      description: "Painting Works",
      previousProgress: "10%",
      receivedAmount: 200000,
      currentProgress: "15%",
      currentAmount: 120000,
      currentTax: 21600,
    },
    {
      slNo: 8,
      description: "Landscaping",
      previousProgress: "5%",
      receivedAmount: 100000,
      currentProgress: "10%",
      currentAmount: 80000,
      currentTax: 14400,
    },
    {
      slNo: 9,
      description: "Fire Safety Systems",
      previousProgress: "20%",
      receivedAmount: 350000,
      currentProgress: "15%",
      currentAmount: 180000,
      currentTax: 32400,
    },
    {
      slNo: 10,
      description: "Lift & Escalator Installation",
      previousProgress: "0%",
      receivedAmount: 0,
      currentProgress: "25%",
      currentAmount: 500000,
      currentTax: 90000,
    },
  ],
};

async function saveInvoice() {
  const pdfBuffer = await htmlToPdf(invoiceData);

  fs.writeFileSync("newINvoice.pdf", pdfBuffer);
  console.log("PDF saved as invoice.pdf");
}

saveInvoice();
