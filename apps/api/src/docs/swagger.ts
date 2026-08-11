export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "VANTA ERP - Operations Intelligence Platform API",
    version: "1.0.0",
    description: "Production REST API for VANTA ERP & CRM operations portal. Supports multi-role RBAC, inventory ledger, transactional sales challan confirmation with strict stock integrity, tax invoice generation, and real-time executive reports."
  },
  servers: [
    {
      url: "http://localhost:5001/api",
      description: "Local Development API Server"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token obtained from POST /api/auth/login"
      }
    },
    schemas: {
      UserDto: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      CustomerDto: {
        type: "object",
        properties: {
          id: { type: "string" },
          customerCode: { type: "string" },
          customerName: { type: "string" },
          mobile: { type: "string" },
          email: { type: "string" },
          businessName: { type: "string" },
          gstNumber: { type: "string" },
          customerType: { type: "string", enum: ["RETAIL", "WHOLESALE", "DISTRIBUTOR"] },
          address: { type: "string" },
          status: { type: "string", enum: ["LEAD", "ACTIVE", "INACTIVE"] }
        }
      },
      ProductDto: {
        type: "object",
        properties: {
          id: { type: "string" },
          productCode: { type: "string" },
          productName: { type: "string" },
          sku: { type: "string" },
          unitPrice: { type: "number" },
          currentStock: { type: "integer" },
          minimumStock: { type: "integer" },
          isLowStock: { type: "boolean" }
        }
      },
      SalesChallanDto: {
        type: "object",
        properties: {
          id: { type: "string" },
          challanNumber: { type: "string" },
          customerId: { type: "string" },
          status: { type: "string", enum: ["DRAFT", "CONFIRMED", "CANCELLED"] },
          totalQuantity: { type: "integer" },
          totalAmount: { type: "number" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                productNameSnapshot: { type: "string" },
                skuSnapshot: { type: "string" },
                unitPriceSnapshot: { type: "number" },
                quantity: { type: "integer" },
                lineTotal: { type: "number" }
              }
            }
          }
        }
      },
      InvoiceDto: {
        type: "object",
        properties: {
          id: { type: "string" },
          invoiceNumber: { type: "string" },
          challanId: { type: "string" },
          customerId: { type: "string" },
          status: { type: "string", enum: ["ISSUED", "PAID", "CANCELLED"] },
          subTotal: { type: "number" },
          taxAmount: { type: "number" },
          grandTotal: { type: "number" },
          dueDate: { type: "string", format: "date-time" },
          issuedAt: { type: "string", format: "date-time" }
        }
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: { type: "object" }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    "/health": {
      get: {
        summary: "System Health Check",
        responses: {
          200: { description: "Service is online and healthy" }
        }
      }
    },
    "/auth/login": {
      post: {
        summary: "Authenticate user and issue JWT",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "admin@example.com" },
                  password: { type: "string", example: "password123" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Authentication successful" },
          401: { description: "Invalid credentials" }
        }
      }
    },
    "/auth/me": {
      get: {
        summary: "Get current authenticated user profile",
        responses: {
          200: { description: "Profile data" }
        }
      }
    },
    "/dashboard/summary": {
      get: {
        summary: "Get live operations intelligence metrics and charts",
        responses: {
          200: { description: "Dashboard summary KPIs and charts" }
        }
      }
    },
    "/customers": {
      get: {
        summary: "List paginated customers with filters",
        responses: {
          200: { description: "Customer list" }
        }
      },
      post: {
        summary: "Create a new customer (Admin, Sales)",
        responses: {
          201: { description: "Customer created" }
        }
      }
    },
    "/customers/{id}/follow-ups": {
      get: {
        summary: "Get follow-up history for a customer",
        responses: {
          200: { description: "Follow-up history" }
        }
      },
      post: {
        summary: "Record follow-up interaction (Admin, Sales)",
        responses: {
          201: { description: "Follow-up logged" }
        }
      }
    },
    "/products": {
      get: {
        summary: "List catalog products with stock levels",
        responses: {
          200: { description: "Product list" }
        }
      },
      post: {
        summary: "Create product (Admin, Warehouse)",
        responses: {
          201: { description: "Product created" }
        }
      }
    },
    "/stock/movements": {
      get: {
        summary: "Audit ledger of stock movements",
        responses: {
          200: { description: "Stock ledger records" }
        }
      },
      post: {
        summary: "Record manual stock adjustment (Warehouse, Admin only)",
        responses: {
          201: { description: "Stock updated" },
          409: { description: "Insufficient stock" }
        }
      }
    },
    "/challans": {
      get: {
        summary: "List sales challans with filter by status",
        responses: {
          200: { description: "Challan list" }
        }
      },
      post: {
        summary: "Create DRAFT sales challan (Admin, Sales)",
        responses: {
          201: { description: "Draft created" }
        }
      }
    },
    "/challans/{id}/confirm": {
      post: {
        summary: "Confirm sales challan & transactionally deduct stock (Admin, Sales)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Challan confirmed and stock deducted" },
          409: { description: "Insufficient stock (atomic rollback)" }
        }
      }
    },
    "/challans/{id}/cancel": {
      post: {
        summary: "Cancel sales challan & reverse inventory (Admin, Sales)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Challan cancelled" }
        }
      }
    },
    "/invoices": {
      get: {
        summary: "List generated tax invoices (Admin, Accounts, Sales)",
        responses: {
          200: { description: "Invoice list" }
        }
      }
    },
    "/invoices/generate": {
      post: {
        summary: "Generate official tax invoice from confirmed challan (Admin, Accounts)",
        responses: {
          201: { description: "Invoice generated" }
        }
      }
    },
    "/reports/stock": {
      get: {
        summary: "Real-time stock inventory valuation report (Admin, Warehouse, Accounts, Sales)",
        responses: {
          200: { description: "Stock valuation report" }
        }
      }
    },
    "/reports/sales": {
      get: {
        summary: "Real-time sales revenue report (Admin, Sales, Accounts)",
        responses: {
          200: { description: "Sales revenue report" }
        }
      }
    },
    "/users": {
      get: {
        summary: "List system users (Admin only)",
        responses: {
          200: { description: "User list" }
        }
      },
      post: {
        summary: "Create new user account (Admin only)",
        responses: {
          201: { description: "User created" }
        }
      }
    }
  }
};
