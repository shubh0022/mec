import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting VANTA ERP database seed...");

  // Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.salesChallanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerFollowUp.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing records.");

  // 1. Create Users
  const passwordHash = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
      isActive: true
    }
  });

  const salesUser = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "sales@example.com",
      passwordHash,
      role: "SALES",
      isActive: true
    }
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: "Mike Johnson",
      email: "warehouse@example.com",
      passwordHash,
      role: "WAREHOUSE",
      isActive: true
    }
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: "Sarah Connor",
      email: "accounts@example.com",
      passwordHash,
      role: "ACCOUNTS",
      isActive: true
    }
  });

  const guestUser = await prisma.user.create({
    data: {
      name: "Guest Explorer",
      email: "guest@vanta.local",
      passwordHash: null,
      role: "GUEST",
      isActive: true
    }
  });

  console.log("👤 Created standard users and dedicated guest user");

  // 2. Create Warehouses
  const centralWarehouse = await prisma.warehouse.create({
    data: {
      name: "Central Distribution Hub",
      code: "WH-01",
      location: "Building 4, Industrial Logistics Zone, Navi Mumbai, MH 400705",
      isActive: true
    }
  });

  const northWarehouse = await prisma.warehouse.create({
    data: {
      name: "North Regional Depot",
      code: "WH-02",
      location: "Sector 18, Phase II, Logistics Park, Gurugram, HR 122015",
      isActive: true
    }
  });

  // 3. Create Categories
  const catPlumbing = await prisma.category.create({
    data: { name: "Plumbing & Piping", code: "CAT-PLM" }
  });
  const catSteel = await prisma.category.create({
    data: { name: "Steel & Metallurgy", code: "CAT-STL" }
  });
  const catBuilding = await prisma.category.create({
    data: { name: "Building & Masonry", code: "CAT-BLD" }
  });
  const catElectrical = await prisma.category.create({
    data: { name: "Electrical & Wiring", code: "CAT-ELE" }
  });
  const catPaints = await prisma.category.create({
    data: { name: "Paints & Coatings", code: "CAT-PNT" }
  });
  const catHardware = await prisma.category.create({
    data: { name: "Industrial Hardware", code: "CAT-HDW" }
  });

  // 4. Create Products
  const productsData = [
    // Low stock items matching reference UI
    {
      productCode: "PRD-1001",
      productName: "PVC Pipe 1 inch",
      sku: "PVC-001",
      categoryId: catPlumbing.id,
      unitPrice: 450,
      currentStock: 5,
      minimumStock: 10,
      warehouseId: centralWarehouse.id
    },
    {
      productCode: "PRD-1002",
      productName: "Steel Rod 10mm",
      sku: "STL-010",
      categoryId: catSteel.id,
      unitPrice: 780,
      currentStock: 7,
      minimumStock: 15,
      warehouseId: centralWarehouse.id
    },
    {
      productCode: "PRD-1003",
      productName: "Cement 50kg",
      sku: "CEM-050",
      categoryId: catBuilding.id,
      unitPrice: 380,
      currentStock: 3,
      minimumStock: 20,
      warehouseId: centralWarehouse.id
    },
    {
      productCode: "PRD-1004",
      productName: "Wire Coil 2mm",
      sku: "WIR-002",
      categoryId: catElectrical.id,
      unitPrice: 1250,
      currentStock: 4,
      minimumStock: 10,
      warehouseId: northWarehouse.id
    },
    {
      productCode: "PRD-1005",
      productName: "Paint White 1L",
      sku: "PNT-001",
      categoryId: catPaints.id,
      unitPrice: 520,
      currentStock: 6,
      minimumStock: 12,
      warehouseId: centralWarehouse.id
    },
    // Healthy stock items
    {
      productCode: "PRD-1006",
      productName: "Industrial Ball Valve 2 inch",
      sku: "VLV-200",
      categoryId: catPlumbing.id,
      unitPrice: 1650,
      currentStock: 85,
      minimumStock: 15,
      warehouseId: centralWarehouse.id
    },
    {
      productCode: "PRD-1007",
      productName: "TMT Bar Fe500D 12mm",
      sku: "TMT-012",
      categoryId: catSteel.id,
      unitPrice: 920,
      currentStock: 140,
      minimumStock: 30,
      warehouseId: centralWarehouse.id
    },
    {
      productCode: "PRD-1008",
      productName: "Copper Armored Cable 4-Core",
      sku: "CBL-4CR",
      categoryId: catElectrical.id,
      unitPrice: 2850,
      currentStock: 48,
      minimumStock: 10,
      warehouseId: northWarehouse.id
    },
    {
      productCode: "PRD-1009",
      productName: "Heavy Duty Angle Grinder 850W",
      sku: "GRD-850",
      categoryId: catHardware.id,
      unitPrice: 3400,
      currentStock: 32,
      minimumStock: 8,
      warehouseId: centralWarehouse.id
    },
    {
      productCode: "PRD-1010",
      productName: "Industrial Waterproof Primer 20L",
      sku: "PRM-020",
      categoryId: catPaints.id,
      unitPrice: 4200,
      currentStock: 25,
      minimumStock: 5,
      warehouseId: northWarehouse.id
    },
    {
      productCode: "PRD-1011",
      productName: "Stainless Steel Fasteners Box M8",
      sku: "FST-M08",
      categoryId: catHardware.id,
      unitPrice: 650,
      currentStock: 120,
      minimumStock: 25,
      warehouseId: centralWarehouse.id
    },
    {
      productCode: "PRD-1012",
      productName: "MCB Double Pole 32A",
      sku: "MCB-032",
      categoryId: catElectrical.id,
      unitPrice: 480,
      currentStock: 95,
      minimumStock: 20,
      warehouseId: northWarehouse.id
    }
  ];

  const createdProducts: any = {};
  for (const item of productsData) {
    const product = await prisma.product.create({
      data: item
    });
    createdProducts[item.sku] = product;

    // Initial stock movement record
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        quantity: product.currentStock,
        movementType: "IN",
        reason: "Initial baseline inventory audit",
        referenceType: "INITIAL_STOCK",
        createdBy: warehouseUser.id,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    });
  }

  console.log(`📦 Seeded ${productsData.length} products with stock movements.`);

  // 5. Create Customers
  const customersData = [
    {
      customerCode: "CUST-1001",
      customerName: "ABC Traders",
      mobile: "+91 98200 12345",
      email: "procurement@abctraders.in",
      businessName: "ABC Traders Pvt Ltd",
      gstNumber: "27AABCU9603R1ZM",
      customerType: "WHOLESALE",
      address: "Gala 14, APMC Market Yard, Vashi, Navi Mumbai, MH 400703",
      status: "ACTIVE",
      notes: "High volume wholesale customer with net 15 payment terms",
      createdBy: salesUser.id
    },
    {
      customerCode: "CUST-1002",
      customerName: "XYZ Distributors",
      mobile: "+91 98110 54321",
      email: "orders@xyzdistributors.com",
      businessName: "XYZ Distribution Corp",
      gstNumber: "07AAACX8812K1Z9",
      customerType: "DISTRIBUTOR",
      address: "Plot 88, Okhla Industrial Area Phase 3, New Delhi 110020",
      status: "ACTIVE",
      notes: "Northern region primary distributor",
      createdBy: salesUser.id
    },
    {
      customerCode: "CUST-1003",
      customerName: "PQR Enterprises",
      mobile: "+91 94440 98765",
      email: "contact@pqrenterprises.com",
      businessName: "PQR Infrastructure & Enterprises",
      gstNumber: "33AABCP4411Q1ZR",
      customerType: "WHOLESALE",
      address: "24 Mount Road, Guindy, Chennai, TN 600032",
      status: "ACTIVE",
      notes: "Contractor for commercial metro expansion",
      createdBy: salesUser.id
    },
    {
      customerCode: "CUST-1004",
      customerName: "LMN Supplies",
      mobile: "+91 97230 45678",
      email: "supply@lmnsupplies.co.in",
      businessName: "LMN Hardware & Supplies Ltd",
      gstNumber: "24AABCL7723D1ZX",
      customerType: "RETAIL",
      address: "102 Ring Road Commercial Complex, Surat, GJ 395002",
      status: "ACTIVE",
      notes: "Regular weekly stock orders",
      createdBy: salesUser.id
    },
    {
      customerCode: "CUST-1005",
      customerName: "Global Traders",
      mobile: "+91 98800 33445",
      email: "info@globaltraders.org",
      businessName: "Global Trading House",
      gstNumber: "29AABCG3311E1ZF",
      customerType: "DISTRIBUTOR",
      address: "56 Peenya Industrial Estate 4th Phase, Bengaluru, KA 560058",
      status: "ACTIVE",
      notes: "Exports & regional distribution partner",
      createdBy: salesUser.id
    },
    // Follow-up customers matching reference image
    {
      customerCode: "CUST-1006",
      customerName: "Shree Traders",
      mobile: "+91 98212 99001",
      email: "purchase@shreetraders.com",
      businessName: "Shree Trading Co",
      gstNumber: "27AABCS1102P1ZT",
      customerType: "WHOLESALE",
      address: "Market Yard Gate 2, Pune, MH 411037",
      status: "ACTIVE",
      followUpDate: new Date("2026-06-01T10:00:00Z"),
      notes: "Discuss bulk purchase agreement for Q3",
      createdBy: adminUser.id
    },
    {
      customerCode: "CUST-1007",
      customerName: "Maa Enterprises",
      mobile: "+91 98300 44556",
      email: "contact@maaenterprises.net",
      businessName: "Maa Enterprises Infrastructure",
      gstNumber: "19AABCM9922K1ZV",
      customerType: "DISTRIBUTOR",
      address: "42 Brabourne Road, Kolkata, WB 700001",
      status: "ACTIVE",
      followUpDate: new Date("2026-06-02T11:30:00Z"),
      notes: "Contract renewal and credit line upgrade review",
      createdBy: salesUser.id
    },
    {
      customerCode: "CUST-1008",
      customerName: "S.K. Distributors",
      mobile: "+91 94190 77889",
      email: "skdistributors@gmail.com",
      businessName: "S.K. Distribution Agency",
      gstNumber: "03AABCS8833B1ZR",
      customerType: "DISTRIBUTOR",
      address: "GT Road Industrial Area, Ludhiana, PB 141003",
      status: "ACTIVE",
      followUpDate: new Date("2026-06-03T14:00:00Z"),
      notes: "Follow up on sample batch feedback for PVC fittings",
      createdBy: warehouseUser.id
    },
    {
      customerCode: "CUST-1009",
      customerName: "Ratan Suppliers",
      mobile: "+91 98760 11223",
      email: "ratan.suppliers@yahoo.com",
      businessName: "Ratan Building Supplies",
      gstNumber: "08AABCR5511C1ZX",
      customerType: "RETAIL",
      address: "Station Road, Jaipur, RJ 302006",
      status: "ACTIVE",
      followUpDate: new Date("2026-06-04T09:30:00Z"),
      notes: "Payment confirmation for invoice INV-2026-092",
      createdBy: adminUser.id
    },
    {
      customerCode: "CUST-1010",
      customerName: "Om Traders",
      mobile: "+91 98980 66778",
      email: "omtraders.ahmedabad@gmail.com",
      businessName: "Om Traders & Co",
      gstNumber: "24AABCO4422M1ZY",
      customerType: "WHOLESALE",
      address: "Near Kalupur Commercial Center, Ahmedabad, GJ 380002",
      status: "ACTIVE",
      followUpDate: new Date("2026-06-05T16:00:00Z"),
      notes: "Follow up on delayed dispatch enquiry",
      createdBy: salesUser.id
    }
  ];

  const createdCustomers: any = {};
  for (const cust of customersData) {
    const customer = await prisma.customer.create({
      data: cust
    });
    createdCustomers[cust.customerName] = customer;

    // Add initial follow-up record for due items
    if (cust.followUpDate) {
      await prisma.customerFollowUp.create({
        data: {
          customerId: customer.id,
          note: cust.notes || "Follow-up scheduled",
          followUpDate: cust.followUpDate,
          createdBy: cust.createdBy
        }
      });
    }
  }

  console.log(`🤝 Seeded ${customersData.length} customers with follow-up ledger.`);

  // 6. Create Sales Challans (matching reference UI)
  const challanData = [
    {
      challanNumber: "CH-2505-001",
      customerName: "ABC Traders",
      status: "CONFIRMED",
      totalAmount: 45230,
      createdAt: new Date("2026-05-31T10:15:00Z"),
      confirmedAt: new Date("2026-05-31T11:00:00Z"),
      confirmedBy: adminUser.id,
      createdBy: salesUser.id,
      items: [
        { product: createdProducts["TMT-012"], quantity: 30 },
        { product: createdProducts["GRD-850"], quantity: 5 }
      ]
    },
    {
      challanNumber: "CH-2505-002",
      customerName: "XYZ Distributors",
      status: "DRAFT",
      totalAmount: 12450,
      createdAt: new Date("2026-05-31T14:30:00Z"),
      createdBy: salesUser.id,
      items: [
        { product: createdProducts["VLV-200"], quantity: 6 },
        { product: createdProducts["FST-M08"], quantity: 4 }
      ]
    },
    {
      challanNumber: "CH-2505-003",
      customerName: "PQR Enterprises",
      status: "CONFIRMED",
      totalAmount: 23540,
      createdAt: new Date("2026-05-30T09:20:00Z"),
      confirmedAt: new Date("2026-05-30T10:00:00Z"),
      confirmedBy: adminUser.id,
      createdBy: salesUser.id,
      items: [
        { product: createdProducts["CBL-4CR"], quantity: 6 },
        { product: createdProducts["MCB-032"], quantity: 13 }
      ]
    },
    {
      challanNumber: "CH-2505-004",
      customerName: "LMN Supplies",
      status: "CONFIRMED",
      totalAmount: 67890,
      createdAt: new Date("2026-05-29T16:45:00Z"),
      confirmedAt: new Date("2026-05-29T17:15:00Z"),
      confirmedBy: adminUser.id,
      createdBy: salesUser.id,
      items: [
        { product: createdProducts["PRM-020"], quantity: 12 },
        { product: createdProducts["GRD-850"], quantity: 5 }
      ]
    },
    {
      challanNumber: "CH-2505-005",
      customerName: "Global Traders",
      status: "CANCELLED",
      totalAmount: 8760,
      createdAt: new Date("2026-05-28T11:10:00Z"),
      createdBy: salesUser.id,
      items: [
        { product: createdProducts["FST-M08"], quantity: 10 },
        { product: createdProducts["PNT-001"], quantity: 4 }
      ]
    }
  ];

  for (const ch of challanData) {
    const customer = createdCustomers[ch.customerName];
    let totalQty = 0;
    ch.items.forEach(i => { totalQty += i.quantity; });

    const challan = await prisma.salesChallan.create({
      data: {
        challanNumber: ch.challanNumber,
        customerId: customer.id,
        status: ch.status,
        totalQuantity: totalQty,
        subTotal: ch.totalAmount,
        totalAmount: ch.totalAmount,
        createdBy: ch.createdBy,
        confirmedBy: ch.confirmedBy,
        confirmedAt: ch.confirmedAt,
        createdAt: ch.createdAt
      }
    });

    for (const item of ch.items) {
      const lineTotal = item.quantity * item.product.unitPrice;
      await prisma.salesChallanItem.create({
        data: {
          challanId: challan.id,
          productId: item.product.id,
          productNameSnapshot: item.product.productName,
          skuSnapshot: item.product.sku,
          unitPriceSnapshot: item.product.unitPrice,
          quantity: item.quantity,
          lineTotal
        }
      });

      // If confirmed, create OUT movement
      if (ch.status === "CONFIRMED") {
        await prisma.stockMovement.create({
          data: {
            productId: item.product.id,
            quantity: item.quantity,
            movementType: "OUT",
            reason: `Sales Challan Confirmation (${ch.challanNumber})`,
            referenceType: "SALES_CHALLAN",
            referenceId: challan.id,
            createdBy: ch.confirmedBy || adminUser.id,
            createdAt: ch.confirmedAt || new Date()
          }
        });
      }
    }

    // If confirmed, create matching Invoice
    if (ch.status === "CONFIRMED") {
      const subTotal = ch.totalAmount;
      const taxAmount = Math.round(subTotal * 0.18);
      const grandTotal = subTotal + taxAmount;
      const invNum = `INV-${ch.challanNumber.replace("CH-", "")}`;

      await prisma.invoice.create({
        data: {
          invoiceNumber: invNum,
          challanId: challan.id,
          customerId: customer.id,
          status: "ISSUED",
          subTotal,
          taxAmount,
          grandTotal,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          issuedAt: ch.confirmedAt || ch.createdAt
        }
      });
    }
  }

  console.log(`📋 Seeded ${challanData.length} sales challans, items, and tax invoices.`);

  // 7. Audit log initial seeds
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: "CHALLAN_CONFIRMED",
      entity: "SalesChallan",
      entityId: "CH-2505-001",
      metadata: JSON.stringify({ customer: "ABC Traders", totalAmount: 45230 }),
      createdAt: new Date("2026-05-31T11:00:00Z")
    }
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
