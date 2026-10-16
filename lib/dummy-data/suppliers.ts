import type {
  GoodsReceipt,
  POLineItem,
  PurchaseOrder,
  Supplier,
  SupplierActivity,
  SupplierPayment,
} from "@/types/supplier";

export const suppliers: Supplier[] = [
  {
    id: "sup_1",
    code: "SUP-1001",
    name: "Radiant Textile Mills",
    contactPerson: "Arvind Menon",
    email: "arvind@radianttextiles.in",
    phone: "+91 98450 11223",
    category: "Fabric",
    gstNumber: "29AACCR1234F1Z5",
    city: "Coimbatore",
    state: "Tamil Nadu",
    country: "India",
    paymentTerms: "Net 30",
    status: "active",
    rating: 4.6,
    totalPurchases: 4820000,
    outstandingAmount: 186000,
    joinedDate: "2022-03-11",
    lastActivityDate: "2026-08-13",
  },
  {
    id: "sup_2",
    code: "SUP-1002",
    name: "Bright Buttons & Trims Co.",
    contactPerson: "Sneha Kulkarni",
    email: "sneha@brighttrims.com",
    phone: "+91 90210 44551",
    category: "Trims",
    gstNumber: "27AAECB5678G1Z2",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    paymentTerms: "Net 15",
    status: "active",
    rating: 4.2,
    totalPurchases: 1120000,
    outstandingAmount: 42500,
    joinedDate: "2021-07-02",
    lastActivityDate: "2026-08-12",
  },
  {
    id: "sup_3",
    code: "SUP-1003",
    name: "EcoPack Solutions",
    contactPerson: "Rohan Das",
    email: "rohan@ecopack.co.in",
    phone: "+91 89012 77332",
    category: "Packaging",
    gstNumber: "19AAFCE4321H1Z9",
    city: "Kolkata",
    state: "West Bengal",
    country: "India",
    paymentTerms: "Net 30",
    status: "active",
    rating: 3.9,
    totalPurchases: 640000,
    outstandingAmount: 0,
    joinedDate: "2023-01-19",
    lastActivityDate: "2026-08-10",
  },
  {
    id: "sup_4",
    code: "SUP-1004",
    name: "Kaleido Print Studio",
    contactPerson: "Meera Iyer",
    email: "meera@kaleidoprint.in",
    phone: "+91 99000 12678",
    category: "Printing",
    gstNumber: "33AAGCK8765J1Z4",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    paymentTerms: "Net 30",
    status: "active",
    rating: 4.4,
    totalPurchases: 985000,
    outstandingAmount: 76000,
    joinedDate: "2022-11-05",
    lastActivityDate: "2026-08-14",
  },
  {
    id: "sup_5",
    code: "SUP-1005",
    name: "Swift Freight Logistics",
    contactPerson: "Karan Bhatt",
    email: "karan@swiftfreight.com",
    phone: "+91 97170 55890",
    category: "Logistics",
    gstNumber: "24AAHCS3456K1Z1",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    paymentTerms: "Net 7",
    status: "active",
    rating: 4.0,
    totalPurchases: 512000,
    outstandingAmount: 28000,
    joinedDate: "2023-06-27",
    lastActivityDate: "2026-08-11",
  },
  {
    id: "sup_6",
    code: "SUP-1006",
    name: "Sunrise Cotton Weavers",
    contactPerson: "Priya Nair",
    email: "priya@sunrisecotton.in",
    phone: "+91 98230 99871",
    category: "Fabric",
    gstNumber: "29AAICS6789L1Z8",
    city: "Erode",
    state: "Tamil Nadu",
    country: "India",
    paymentTerms: "Net 45",
    status: "active",
    rating: 4.8,
    totalPurchases: 3260000,
    outstandingAmount: 0,
    joinedDate: "2020-09-14",
    lastActivityDate: "2026-08-09",
  },
  {
    id: "sup_7",
    code: "SUP-1007",
    name: "Little Charms Trims",
    contactPerson: "Farah Sheikh",
    email: "farah@littlecharms.co.in",
    phone: "+91 90360 22190",
    category: "Trims",
    gstNumber: "07AAJCL2345M1Z6",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    paymentTerms: "Net 15",
    status: "inactive",
    rating: 3.1,
    totalPurchases: 218000,
    outstandingAmount: 15400,
    joinedDate: "2021-02-08",
    lastActivityDate: "2026-05-02",
    notes: "Repeated late deliveries in Q1 — deactivated pending review.",
  },
  {
    id: "sup_8",
    code: "SUP-1008",
    name: "Nova Corrugated Boxes",
    contactPerson: "Vikram Suri",
    email: "vikram@novabox.in",
    phone: "+91 96500 34521",
    category: "Packaging",
    gstNumber: "06AAKCN7890N1Z3",
    city: "Gurugram",
    state: "Haryana",
    country: "India",
    paymentTerms: "Net 30",
    status: "active",
    rating: 4.1,
    totalPurchases: 745000,
    outstandingAmount: 93000,
    joinedDate: "2022-05-30",
    lastActivityDate: "2026-08-13",
  },
  {
    id: "sup_9",
    code: "SUP-1009",
    name: "Pixel Craft Screen Printers",
    contactPerson: "Anjali Rao",
    email: "anjali@pixelcraft.in",
    phone: "+91 91500 66784",
    category: "Printing",
    gstNumber: "29AALCP1122P1Z7",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    paymentTerms: "Net 30",
    status: "active",
    rating: 3.7,
    totalPurchases: 412000,
    outstandingAmount: 51000,
    joinedDate: "2023-09-21",
    lastActivityDate: "2026-08-08",
  },
  {
    id: "sup_10",
    code: "SUP-1010",
    name: "Metro Cargo Movers",
    contactPerson: "Sandeep Joshi",
    email: "sandeep@metrocargo.in",
    phone: "+91 98111 40092",
    category: "Logistics",
    gstNumber: "27AAMCM4567Q1Z0",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    paymentTerms: "Net 7",
    status: "active",
    rating: 4.3,
    totalPurchases: 358000,
    outstandingAmount: 0,
    joinedDate: "2022-12-03",
    lastActivityDate: "2026-08-05",
  },
  {
    id: "sup_11",
    code: "SUP-1011",
    name: "Golden Thread Fabrics",
    contactPerson: "Divya Menon",
    email: "divya@goldenthread.in",
    phone: "+91 90090 88123",
    category: "Fabric",
    gstNumber: "29AANCG5566R1Z9",
    city: "Tirupur",
    state: "Tamil Nadu",
    country: "India",
    paymentTerms: "Net 30",
    status: "active",
    rating: 4.5,
    totalPurchases: 2140000,
    outstandingAmount: 134000,
    joinedDate: "2021-10-17",
    lastActivityDate: "2026-08-14",
  },
  {
    id: "sup_12",
    code: "SUP-1012",
    name: "Tiny Buttons Traders",
    contactPerson: "Imran Qureshi",
    email: "imran@tinybuttons.in",
    phone: "+91 99870 21456",
    category: "Trims",
    gstNumber: "24AAOCT8899S1Z2",
    city: "Surat",
    state: "Gujarat",
    country: "India",
    paymentTerms: "Net 15",
    status: "inactive",
    rating: 2.8,
    totalPurchases: 96000,
    outstandingAmount: 8200,
    joinedDate: "2023-04-12",
    lastActivityDate: "2026-04-18",
    notes: "Quality complaints on last two shipments — under review.",
  },
];

function items(...rows: Array<Omit<POLineItem, "id">>): POLineItem[] {
  return rows.map((r, i) => ({ id: `item_${i + 1}`, ...r }));
}

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "po_1",
    poNumber: "PO-2026-0041",
    supplierId: "sup_1",
    supplierName: "Radiant Textile Mills",
    status: "pending",
    orderDate: "2026-08-10",
    expectedDeliveryDate: "2026-08-24",
    tax: 5,
    items: items(
      { description: "Combed Cotton Jersey 180 GSM", barcode: "2000090000193", quantity: 1200, receivedQuantity: 0, unitPrice: 210 },
      { description: "Organic Cotton Twill 220 GSM", barcode: "2000090000209", quantity: 600, receivedQuantity: 0, unitPrice: 265 },
    ),
  },
  {
    id: "po_2",
    poNumber: "PO-2026-0040",
    supplierId: "sup_2",
    supplierName: "Bright Buttons & Trims Co.",
    status: "pending",
    orderDate: "2026-08-09",
    expectedDeliveryDate: "2026-08-19",
    tax: 12,
    items: items(
      { description: "Snap Buttons 12mm (Pastel Mix)", barcode: "2000090000216", quantity: 8000, receivedQuantity: 0, unitPrice: 3.2 },
      { description: "Elastic Waistband 25mm", barcode: "2000090000223", quantity: 2400, receivedQuantity: 0, unitPrice: 9.5 },
    ),
  },
  {
    id: "po_3",
    poNumber: "PO-2026-0038",
    supplierId: "sup_6",
    supplierName: "Sunrise Cotton Weavers",
    status: "partial",
    orderDate: "2026-07-28",
    expectedDeliveryDate: "2026-08-12",
    tax: 5,
    items: items(
      { description: "Interlock Cotton Fabric 200 GSM", barcode: "2000090000230", quantity: 2000, receivedQuantity: 1400, unitPrice: 198 },
    ),
  },
  {
    id: "po_4",
    poNumber: "PO-2026-0035",
    supplierId: "sup_4",
    supplierName: "Kaleido Print Studio",
    status: "received",
    orderDate: "2026-07-15",
    expectedDeliveryDate: "2026-07-29",
    tax: 12,
    items: items(
      { description: "Digital Print - Dino Splash (per meter)", barcode: "2000090000247", quantity: 900, receivedQuantity: 900, unitPrice: 145 },
    ),
  },
  {
    id: "po_5",
    poNumber: "PO-2026-0033",
    supplierId: "sup_3",
    supplierName: "EcoPack Solutions",
    status: "received",
    orderDate: "2026-07-10",
    expectedDeliveryDate: "2026-07-22",
    tax: 18,
    items: items(
      { description: "Recycled Poly Mailers 12x16", barcode: "2000090000254", quantity: 5000, receivedQuantity: 5000, unitPrice: 4.1 },
      { description: "Kraft Garment Boxes Medium", barcode: "2000090000261", quantity: 1500, receivedQuantity: 1500, unitPrice: 22 },
    ),
  },
  {
    id: "po_6",
    poNumber: "PO-2026-0030",
    supplierId: "sup_7",
    supplierName: "Little Charms Trims",
    status: "cancelled",
    orderDate: "2026-06-30",
    expectedDeliveryDate: "2026-07-14",
    tax: 12,
    notes: "Cancelled — supplier could not meet revised lead time.",
    items: items(
      { description: "Embroidered Patches - Floral", barcode: "2000090000278", quantity: 3000, receivedQuantity: 0, unitPrice: 6.8 },
    ),
  },
  {
    id: "po_7",
    poNumber: "PO-2026-0028",
    supplierId: "sup_11",
    supplierName: "Golden Thread Fabrics",
    status: "received",
    orderDate: "2026-06-22",
    expectedDeliveryDate: "2026-07-05",
    tax: 5,
    items: items(
      { description: "Ribbed Cotton Cuff Fabric", barcode: "2000090000285", quantity: 800, receivedQuantity: 800, unitPrice: 175 },
    ),
  },
  {
    id: "po_8",
    poNumber: "PO-2026-0026",
    supplierId: "sup_8",
    supplierName: "Nova Corrugated Boxes",
    status: "partial",
    orderDate: "2026-06-18",
    expectedDeliveryDate: "2026-07-01",
    tax: 18,
    items: items(
      { description: "Export Corrugated Cartons 18x12x10", barcode: "2000090000292", quantity: 2000, receivedQuantity: 1250, unitPrice: 38 },
    ),
  },
  {
    id: "po_9",
    poNumber: "PO-2026-0024",
    supplierId: "sup_9",
    supplierName: "Pixel Craft Screen Printers",
    status: "cancelled",
    orderDate: "2026-06-05",
    expectedDeliveryDate: "2026-06-19",
    tax: 12,
    notes: "Duplicate order — cancelled in favor of PO-2026-0035.",
    items: items(
      { description: "Screen Print - Rainbow Stripe", barcode: "2000090000308", quantity: 600, receivedQuantity: 0, unitPrice: 130 },
    ),
  },
  {
    id: "po_10",
    poNumber: "PO-2026-0042",
    supplierId: "sup_12",
    supplierName: "Tiny Buttons Traders",
    status: "pending",
    orderDate: "2026-08-12",
    expectedDeliveryDate: "2026-08-26",
    tax: 12,
    items: items(
      { description: "Novelty Shank Buttons Mix", barcode: "2000090000315", quantity: 5000, receivedQuantity: 0, unitPrice: 2.4 },
    ),
  },
  {
    id: "po_11",
    poNumber: "PO-2026-0022",
    supplierId: "sup_5",
    supplierName: "Swift Freight Logistics",
    status: "received",
    orderDate: "2026-05-28",
    expectedDeliveryDate: "2026-06-04",
    tax: 18,
    items: items(
      { description: "Inbound Freight — Coimbatore to Bengaluru (FTL)", barcode: "2000090000322", quantity: 4, receivedQuantity: 4, unitPrice: 18500 },
    ),
  },
  {
    id: "po_12",
    poNumber: "PO-2026-0044",
    supplierId: "sup_1",
    supplierName: "Radiant Textile Mills",
    status: "pending",
    orderDate: "2026-08-14",
    expectedDeliveryDate: "2026-08-28",
    tax: 5,
    items: items(
      { description: "French Terry Fleece 260 GSM", barcode: "2000090000339", quantity: 900, receivedQuantity: 0, unitPrice: 255 },
    ),
  },
];

export const goodsReceipts: GoodsReceipt[] = [
  {
    id: "gr_1",
    grnNumber: "GRN-3081",
    poId: "po_4",
    poNumber: "PO-2026-0035",
    supplierId: "sup_4",
    supplierName: "Kaleido Print Studio",
    type: "full",
    receivedDate: "2026-07-28",
    receivedBy: "Warehouse — Ramesh K.",
    items: [
      { id: "gri_1", description: "Digital Print - Dino Splash (per meter)", orderedQty: 900, receivedQty: 900, damagedQty: 0, missingQty: 0 },
    ],
  },
  {
    id: "gr_2",
    grnNumber: "GRN-3079",
    poId: "po_5",
    poNumber: "PO-2026-0033",
    supplierId: "sup_3",
    supplierName: "EcoPack Solutions",
    type: "full",
    receivedDate: "2026-07-21",
    receivedBy: "Warehouse — Fatima N.",
    items: [
      { id: "gri_1", description: "Recycled Poly Mailers 12x16", orderedQty: 5000, receivedQty: 5000, damagedQty: 0, missingQty: 0 },
      { id: "gri_2", description: "Kraft Garment Boxes Medium", orderedQty: 1500, receivedQty: 1500, damagedQty: 0, missingQty: 0 },
    ],
  },
  {
    id: "gr_3",
    grnNumber: "GRN-3075",
    poId: "po_3",
    poNumber: "PO-2026-0038",
    supplierId: "sup_6",
    supplierName: "Sunrise Cotton Weavers",
    type: "partial",
    receivedDate: "2026-08-11",
    receivedBy: "Warehouse — Ramesh K.",
    remarks: "Remaining 600m expected in next batch, delayed due to dyeing backlog.",
    items: [
      { id: "gri_1", description: "Interlock Cotton Fabric 200 GSM", orderedQty: 2000, receivedQty: 1400, damagedQty: 0, missingQty: 0 },
    ],
  },
  {
    id: "gr_4",
    grnNumber: "GRN-3070",
    poId: "po_8",
    poNumber: "PO-2026-0026",
    supplierId: "sup_8",
    supplierName: "Nova Corrugated Boxes",
    type: "partial",
    receivedDate: "2026-07-02",
    receivedBy: "Warehouse — Fatima N.",
    remarks: "Balance cartons on backorder — supplier confirmed dispatch next week.",
    items: [
      { id: "gri_1", description: "Export Corrugated Cartons 18x12x10", orderedQty: 2000, receivedQty: 1250, damagedQty: 0, missingQty: 0 },
    ],
  },
  {
    id: "gr_5",
    grnNumber: "GRN-3066",
    poId: "po_7",
    poNumber: "PO-2026-0028",
    supplierId: "sup_11",
    supplierName: "Golden Thread Fabrics",
    type: "damaged",
    receivedDate: "2026-07-06",
    receivedBy: "Warehouse — Ramesh K.",
    remarks: "12 rolls water-damaged in transit — claim raised with logistics partner.",
    items: [
      { id: "gri_1", description: "Ribbed Cotton Cuff Fabric", orderedQty: 800, receivedQty: 764, damagedQty: 24, missingQty: 12 },
    ],
  },
  {
    id: "gr_6",
    grnNumber: "GRN-3061",
    poId: "po_11",
    poNumber: "PO-2026-0022",
    supplierId: "sup_5",
    supplierName: "Swift Freight Logistics",
    type: "full",
    receivedDate: "2026-06-04",
    receivedBy: "Warehouse — Fatima N.",
    items: [
      { id: "gri_1", description: "Inbound Freight — Coimbatore to Bengaluru (FTL)", orderedQty: 4, receivedQty: 4, damagedQty: 0, missingQty: 0 },
    ],
  },
  {
    id: "gr_7",
    grnNumber: "GRN-3058",
    poId: "po_1",
    poNumber: "PO-2026-0041",
    supplierId: "sup_1",
    supplierName: "Radiant Textile Mills",
    type: "damaged",
    receivedDate: "2026-05-19",
    receivedBy: "Warehouse — Ramesh K.",
    remarks: "3 bales mildew-affected — returned to supplier for credit note.",
    items: [
      { id: "gri_1", description: "Combed Cotton Jersey 180 GSM", orderedQty: 1000, receivedQty: 970, damagedQty: 15, missingQty: 15 },
    ],
  },
];

export const supplierPayments: SupplierPayment[] = [
  {
    id: "pay_1",
    paymentRef: "PAY-9021",
    supplierId: "sup_1",
    supplierName: "Radiant Textile Mills",
    poId: "po_1",
    poNumber: "PO-2026-0041",
    invoiceNumber: "INV-RT-4471",
    amount: 411000,
    paidAmount: 225000,
    status: "partial",
    dueDate: "2026-08-24",
  },
  {
    id: "pay_2",
    paymentRef: "PAY-9018",
    supplierId: "sup_2",
    supplierName: "Bright Buttons & Trims Co.",
    poId: "po_2",
    poNumber: "PO-2026-0040",
    invoiceNumber: "INV-BB-2290",
    amount: 48400,
    paidAmount: 0,
    status: "pending",
    dueDate: "2026-08-19",
  },
  {
    id: "pay_3",
    paymentRef: "PAY-9004",
    supplierId: "sup_4",
    supplierName: "Kaleido Print Studio",
    poId: "po_4",
    poNumber: "PO-2026-0035",
    invoiceNumber: "INV-KP-1187",
    amount: 130500,
    paidAmount: 130500,
    status: "paid",
    dueDate: "2026-08-05",
    paidDate: "2026-08-01",
    method: "Bank Transfer",
  },
  {
    id: "pay_4",
    paymentRef: "PAY-8996",
    supplierId: "sup_3",
    supplierName: "EcoPack Solutions",
    poId: "po_5",
    poNumber: "PO-2026-0033",
    invoiceNumber: "INV-EP-0876",
    amount: 53300,
    paidAmount: 53300,
    status: "paid",
    dueDate: "2026-07-22",
    paidDate: "2026-07-19",
    method: "UPI",
  },
  {
    id: "pay_5",
    paymentRef: "PAY-8975",
    supplierId: "sup_8",
    supplierName: "Nova Corrugated Boxes",
    poId: "po_8",
    poNumber: "PO-2026-0026",
    invoiceNumber: "INV-NB-0552",
    amount: 91000,
    paidAmount: 45000,
    status: "partial",
    dueDate: "2026-08-01",
  },
  {
    id: "pay_6",
    paymentRef: "PAY-8960",
    supplierId: "sup_9",
    supplierName: "Pixel Craft Screen Printers",
    invoiceNumber: "INV-PC-0331",
    amount: 51000,
    paidAmount: 0,
    status: "pending",
    dueDate: "2026-08-30",
  },
  {
    id: "pay_7",
    paymentRef: "PAY-8942",
    supplierId: "sup_11",
    supplierName: "Golden Thread Fabrics",
    poId: "po_7",
    poNumber: "PO-2026-0028",
    invoiceNumber: "INV-GT-1290",
    amount: 140000,
    paidAmount: 140000,
    status: "paid",
    dueDate: "2026-07-05",
    paidDate: "2026-07-03",
    method: "Bank Transfer",
  },
  {
    id: "pay_8",
    paymentRef: "PAY-8930",
    supplierId: "sup_5",
    supplierName: "Swift Freight Logistics",
    poId: "po_11",
    poNumber: "PO-2026-0022",
    invoiceNumber: "INV-SF-0219",
    amount: 74000,
    paidAmount: 74000,
    status: "paid",
    dueDate: "2026-06-04",
    paidDate: "2026-06-04",
    method: "Cheque",
  },
  {
    id: "pay_9",
    paymentRef: "PAY-8899",
    supplierId: "sup_7",
    supplierName: "Little Charms Trims",
    invoiceNumber: "INV-LC-0098",
    amount: 15400,
    paidAmount: 0,
    status: "pending",
    dueDate: "2026-05-10",
  },
  {
    id: "pay_10",
    paymentRef: "PAY-8880",
    supplierId: "sup_12",
    supplierName: "Tiny Buttons Traders",
    invoiceNumber: "INV-TB-0064",
    amount: 8200,
    paidAmount: 0,
    status: "pending",
    dueDate: "2026-04-25",
  },
  {
    id: "pay_11",
    paymentRef: "PAY-8865",
    supplierId: "sup_6",
    supplierName: "Sunrise Cotton Weavers",
    poId: "po_3",
    poNumber: "PO-2026-0038",
    invoiceNumber: "INV-SC-2287",
    amount: 277200,
    paidAmount: 277200,
    status: "paid",
    dueDate: "2026-07-15",
    paidDate: "2026-07-12",
    method: "Bank Transfer",
  },
  {
    id: "pay_12",
    paymentRef: "PAY-8850",
    supplierId: "sup_1",
    supplierName: "Radiant Textile Mills",
    invoiceNumber: "INV-RT-4390",
    amount: 96000,
    paidAmount: 96000,
    status: "paid",
    dueDate: "2026-06-20",
    paidDate: "2026-06-18",
    method: "Bank Transfer",
  },
];

export const supplierActivity: SupplierActivity[] = [
  { id: "act_1", type: "purchase_order", message: "New purchase order raised — PO-2026-0044", supplierName: "Radiant Textile Mills", timestamp: "2026-08-14T09:20:00+05:30" },
  { id: "act_2", type: "payment", message: "Partial payment of ₹2,25,000 recorded", supplierName: "Radiant Textile Mills", timestamp: "2026-08-13T16:05:00+05:30" },
  { id: "act_3", type: "goods_received", message: "Partial goods received — GRN-3075", supplierName: "Sunrise Cotton Weavers", timestamp: "2026-08-11T11:40:00+05:30" },
  { id: "act_4", type: "supplier", message: "Supplier profile updated — new payment terms (Net 15)", supplierName: "Bright Buttons & Trims Co.", timestamp: "2026-08-12T14:12:00+05:30" },
  { id: "act_5", type: "purchase_order", message: "New purchase order raised — PO-2026-0042", supplierName: "Tiny Buttons Traders", timestamp: "2026-08-12T10:02:00+05:30" },
  { id: "act_6", type: "payment", message: "Invoice INV-KP-1187 marked paid", supplierName: "Kaleido Print Studio", timestamp: "2026-08-01T12:30:00+05:30" },
  { id: "act_7", type: "goods_received", message: "Damaged shipment logged — 12 rolls missing", supplierName: "Golden Thread Fabrics", timestamp: "2026-07-06T15:22:00+05:30" },
  { id: "act_8", type: "supplier", message: "Supplier deactivated after quality review", supplierName: "Tiny Buttons Traders", timestamp: "2026-04-18T09:00:00+05:30" },
  { id: "act_9", type: "purchase_order", message: "Purchase order cancelled — lead time mismatch", supplierName: "Little Charms Trims", timestamp: "2026-06-30T13:15:00+05:30" },
  { id: "act_10", type: "goods_received", message: "Full shipment received — GRN-3079", supplierName: "EcoPack Solutions", timestamp: "2026-07-21T10:48:00+05:30" },
];

export function getSupplierById(id: string): Supplier | undefined {
  return suppliers.find((s) => s.id === id);
}

export function getPurchaseOrderById(id: string): PurchaseOrder | undefined {
  return purchaseOrders.find((po) => po.id === id);
}

export function getPurchaseOrdersBySupplier(supplierId: string): PurchaseOrder[] {
  return purchaseOrders.filter((po) => po.supplierId === supplierId);
}

export function getPaymentsBySupplier(supplierId: string): SupplierPayment[] {
  return supplierPayments.filter((p) => p.supplierId === supplierId);
}

export function getGoodsReceiptsBySupplier(supplierId: string): GoodsReceipt[] {
  return goodsReceipts.filter((g) => g.supplierId === supplierId);
}

export function poTotal(po: PurchaseOrder): number {
  const subtotal = po.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  return Math.round(subtotal * (1 + po.tax / 100));
}

export function poSubtotal(po: PurchaseOrder): number {
  return po.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function getDashboardStats() {
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
  const outstandingPayments = suppliers.reduce((sum, s) => sum + s.outstandingAmount, 0);
  const totalPurchases = suppliers.reduce((sum, s) => sum + s.totalPurchases, 0);
  return { totalSuppliers, activeSuppliers, outstandingPayments, totalPurchases };
}

export function getRecentActivity(limit = 6): SupplierActivity[] {
  return [...supplierActivity]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export interface PurchaseReportRow {
  category: string;
  totalAmount: number;
  orderCount: number;
}

export function getPurchaseReport(): PurchaseReportRow[] {
  const map = new Map<string, PurchaseReportRow>();
  for (const po of purchaseOrders) {
    const supplier = getSupplierById(po.supplierId);
    if (!supplier) continue;
    const entry = map.get(supplier.category) ?? { category: supplier.category, totalAmount: 0, orderCount: 0 };
    entry.totalAmount += poTotal(po);
    entry.orderCount += 1;
    map.set(supplier.category, entry);
  }
  return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
}

export interface LedgerEntry {
  date: string;
  type: string;
  description: string;
  debit: number;
  credit: number;
}

export function getSupplierLedger(supplierId: string): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  for (const po of getPurchaseOrdersBySupplier(supplierId)) {
    entries.push({ date: po.orderDate, type: "Purchase Order", description: `${po.poNumber} raised`, debit: poTotal(po), credit: 0 });
  }
  for (const p of getPaymentsBySupplier(supplierId)) {
    if (p.paidAmount > 0) {
      entries.push({
        date: p.paidDate ?? p.dueDate,
        type: "Payment",
        description: `${p.paymentRef} settled via ${p.method ?? "recorded method"}`,
        debit: 0,
        credit: p.paidAmount,
      });
    }
  }
  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getOutstandingReport(): Supplier[] {
  return [...suppliers].filter((s) => s.outstandingAmount > 0).sort((a, b) => b.outstandingAmount - a.outstandingAmount);
}

export interface SupplierReportSummary {
  totalSuppliers: number;
  activeSuppliers: number;
  totalPurchases: number;
  outstanding: number;
  overdue: number;
}

export function getSupplierReportSummary(today = new Date().toISOString().slice(0, 10)): SupplierReportSummary {
  const totalPurchases = purchaseOrders.reduce((sum, po) => sum + poTotal(po), 0);
  const overdue = supplierPayments
    .filter((p) => p.status !== "paid" && p.dueDate < today)
    .reduce((sum, p) => sum + (p.amount - p.paidAmount), 0);
  return {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter((s) => s.status === "active").length,
    totalPurchases,
    outstanding: suppliers.reduce((sum, s) => sum + s.outstandingAmount, 0),
    overdue,
  };
}

export interface SupplierProductPriceRow {
  barcode: string;
  description: string;
  prices: { supplierName: string; price: number; date: string }[];
}

export function getSupplierProductPricing(): SupplierProductPriceRow[] {
  const byBarcode = new Map<string, SupplierProductPriceRow>();
  for (const po of purchaseOrders) {
    for (const item of po.items) {
      const row = byBarcode.get(item.barcode) ?? { barcode: item.barcode, description: item.description, prices: [] };
      const existing = row.prices.find((p) => p.supplierName === po.supplierName);
      if (!existing || po.orderDate > existing.date) {
        if (existing) {
          existing.price = item.unitPrice;
          existing.date = po.orderDate;
        } else {
          row.prices.push({ supplierName: po.supplierName, price: item.unitPrice, date: po.orderDate });
        }
      }
      byBarcode.set(item.barcode, row);
    }
  }
  return [...byBarcode.values()]
    .filter((row) => row.prices.length > 1)
    .map((row) => ({ ...row, prices: [...row.prices].sort((a, b) => a.price - b.price) }))
    .sort((a, b) => a.description.localeCompare(b.description));
}

export interface SupplierPerformanceRow {
  supplier: Supplier;
  totalOrders: number;
  onTimeRate: number;
  defectRate: number;
}

export function getSupplierPerformance(): SupplierPerformanceRow[] {
  return suppliers
    .map((s) => {
      const orders = getPurchaseOrdersBySupplier(s.id);
      const totalOrders = orders.length;
      const received = orders.filter((o) => o.status === "received").length;
      const onTimeRate = totalOrders ? Math.round((received / totalOrders) * 100) : 0;

      const receipts = getGoodsReceiptsBySupplier(s.id);
      const receivedQty = receipts.reduce((sum, r) => sum + r.items.reduce((s2, i) => s2 + i.receivedQty, 0), 0);
      const defectQty = receipts.reduce((sum, r) => sum + r.items.reduce((s2, i) => s2 + i.damagedQty + i.missingQty, 0), 0);
      const defectRate = receivedQty + defectQty ? Math.round((defectQty / (receivedQty + defectQty)) * 1000) / 10 : 0;

      return { supplier: s, totalOrders, onTimeRate, defectRate };
    })
    .sort((a, b) => b.supplier.rating - a.supplier.rating);
}
