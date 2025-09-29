import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatNumber(num) {
  return typeof num === "number" ? num.toLocaleString("en-IN") : num;
}

export async function htmlToPdf(invoiceData) {
  const templatePath = path.join(__dirname, "template_copy.html");
  let html = fs.readFileSync(templatePath, "utf8");

  // Replace image paths with Supabase URLs (assuming online hosting)
  html = html.replace(
    /src="\.\//g,
    'src="https://jegdjcrxqqxzcmboiblb.supabase.co/storage/v1/object/public/test/'
  );

  // Generate items table
  const itemsTable = invoiceData.items
    .map(
      (item) => `
      <tr>
        <td class="border border-gray-400 p-1 text-right">${item.slNo}</td>
        <td class="border border-gray-400 p-1">${item.description}</td>
        <td class="border border-gray-400 p-1 text-right">${
          item.previousProgress
        }</td>
        <td class="border border-gray-400 p-1 text-right">${formatNumber(
          item.receivedAmount
        )}</td>
        <td class="border border-gray-400 p-1 text-right">${
          item.currentProgress
        }</td>
        <td class="border border-gray-400 p-1 text-right">${formatNumber(
          item.currentAmount
        )}</td>
        <td class="border border-gray-400 p-1 text-right">${formatNumber(
          item.currentTax
        )}</td>
      </tr>`
    )
    .join("");

  // Prepare replacements
  const replacements = {
    ...invoiceData,
    itemsTable,
    companyName:
      invoiceData.companyName || "IQEAS Offshore Engineering Private Limited",
    cin: invoiceData.cin || "U45204KL2022PTC077369",
    addressLine1:
      invoiceData.addressLine1 ||
      "Creche and Dispensary Building, Kinfra Textile Centre, Nadukani",
    addressLine2:
      invoiceData.addressLine2 ||
      "Taliparamba - Manakadavu - Coorg Rd, Kannur - 670 142, Kerala, India",
    gstn: invoiceData.gstn || "32AAGCI8105D1Z1",
    invoiceReference: invoiceData.invoiceReference || "INV-2025-101",
    invoiceDate: invoiceData.invoiceDate || "2025-08-26",
    paymentAppNo: invoiceData.paymentAppNo || "PA-2025-001",
    paymentDate: invoiceData.paymentDate || "2025-08-26",
    poRef: invoiceData.poRef || "PRJ-2025-01",
    billingPeriod: invoiceData.billingPeriod || "August 2025",
    buyerName: invoiceData.buyerName || "Acme Corporation",
    buyerAddress:
      invoiceData.buyerAddress || "123 Main Street, Springfield, IL",
    buyerEmail: invoiceData.buyerEmail || "accounts@acme.com",
    buyerGstn: invoiceData.buyerGstn || "27AAACB1234F1Z5",
    projectNo: invoiceData.projectNo || "PRJ-2025-01",
    projectName: invoiceData.projectName || "New Factory Setup",
    projectValue: formatNumber(invoiceData.projectValue || 5000000),
    variationAmount: formatNumber(invoiceData.variationAmount || 50000),
    paymentTerms:
      invoiceData.paymentTerms ||
      "Incoterm, 100% Payment against Proforma Invoice",
    remittanceName:
      invoiceData.remittanceName ||
      "IQEAS Offshore Engineering Private Limited",
    accountNumber: invoiceData.accountNumber || "11270200019699",
    bankName: invoiceData.bankName || "Federal Bank, Taliparamba",
    ifscCode: invoiceData.ifscCode || "FDRL0001127",
    swiftCode: invoiceData.swiftCode || "FDRLINBB",
    email: invoiceData.email || "admin@iqeasoffshore.com",
    website: invoiceData.website || "www.iqeasoffshore.com",
    phone: invoiceData.phone || "+91 8129250331",
  };

  // Replace placeholders in HTML
  Object.entries(replacements).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  // Enforce A4 size and prevent overflow
  await page.evaluate(() => {
    document.body.style.overflow = "hidden";
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    height: "297mm",
    width: "210mm",
  });

  await browser.close();

  const pdfPath = path.join(
    __dirname,
    `${invoiceData.invoiceReference || "invoice"}.pdf`
  );
  fs.writeFileSync(pdfPath, pdfBuffer);

  console.log(`PDF saved as ${pdfPath}`);
  return pdfBuffer;
}
