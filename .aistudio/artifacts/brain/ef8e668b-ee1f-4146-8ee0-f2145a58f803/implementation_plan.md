# Café & Kitchen Inventory Partitioning, RBAC, and Stockroom Requisition Printables

Provide operational inventory partitioning across Café, Kitchen, and Utility departments with strict Role-Based Access Control (Manager/Admin vs. Employee) and clean printable requisition slips for stock transfers from the central stockroom to the bar and kitchen stations.

***

## User Review & Critical Decisions

> [!IMPORTANT]
> Please review the role permissions and stock transfer workflow outlined below. Confirm if any additional approval gates or departmental categories are required before proceeding.

* **Confirmed Role Scopes**:
  * **Manager / Administrator**: Unrestricted access across the system — inventory stock adjustments, unit cost & price modifications, recipe profit margin calculators, overhead settings (rent, electricity, water, labor payroll), and business profile.
  * **Employee (Barista / Chef / Stock Custodian)**: Restricted access scoped strictly to the **Inventory & Stocks** workspace — updating on-hand counts, receiving deliveries, logging spoilage/wastage, and generating stockroom transfer slips. Sensitive financials, overhead rates, and recipe profit margins are protected behind manager authorization.
* **Confirmed Transfer Destinations**:
  * **Bar / Café Station**: Coffee beans, milks, beverage syrups, matcha, cups, and beverage add-ons.
  * **Kitchen & Pastry Station**: Flours, butter, dairy, baking supplies, food produce, and savory ingredients.
  * **Stockroom Origin**: Central storage holds inventory balances and dispatches requisition vouchers.

***

## 1. Overview & Core Concept

### What It Does
1. **Three-Department Inventory Architecture**: Segregates raw materials and consumables into three functional domains:
   * **☕ Café & Bar**: Beverage ingredients, coffee beans, syrups, milks, teas, and toppings.
   * **🍳 Kitchen & Pastry**: Culinary pantry, flours, dairy for cooking, produce, proteins, and baking goods.
   * **🧹 Utility & Consumables**: Cups, lids, straws, takeaway containers, packaging, cleaning chemicals, and sanitizers.
2. **Role-Based Access Control (RBAC)**: Enforces clear boundary permissions between Café Managers/Admins and Store Employees. Employees can freely adjust counts and log physical movements, while cost rates, recipe margins, and confidential shop overheads require administrative authentication (Manager PIN / Role switch).
3. **Formal Stock Transfer Requisition Slips**: A digital dispatch system allowing staff to requisition items from the central stockroom into the bar or kitchen. Generates an itemized, printer-ready voucher formatted for 8.5x11" or A4 paper with receipt timestamps and formal physical sign-off lines.

### Target Audience & Persona
* **Café Managers & Owners**: Need to protect sensitive cost margins, rent, utilities, and payroll rates from non-managerial staff while retaining full oversight of stock health.
* **Baristas & Kitchen Staff**: Need quick, friction-free interfaces on POS/tablet terminals to record received deliveries, deduct spoilage, log restocks, and print shift transfer forms.
* **Stock Custodians**: Need verifiable paper audit trails documenting quantities transferred out of central storage to individual preparation stations.

### Key Value
Eliminates stock discrepancies between central storage and preparation stations, stops unauthorized changes to confidential financial recipes, and provides a physical paper-trail mechanism for daily shift handovers.

***

## 2. User Experience & Visual Design

### Key User Flows
1. **Role Context Switching & Safeguard Gate**:
   * Users see their active role displayed in the top navigation bar (`Admin / Manager` or `Staff / Employee`).
   * When in Employee mode, attempting to access Recipe Costing, Menu Profitability, or Business Overhead Settings triggers the `AdminAccessGate` with a PIN entry modal or prompt to remain in the Inventory workspace.
   * Employees have unfettered access to the Inventory & Stocks view, with quick action buttons to log deliveries, report waste, and initiate a stock transfer.
2. **Departmental Filtering & Stock Balancing**:
   * Inventory workspace features segmented department selectors (`All Stations`, `☕ Café & Bar`, `🍳 Kitchen`, `🧹 Utility`).
   * Summary metrics show station-specific valuation, low-stock count, and total tracked line items using tabular figures.
   * Fast search and threshold filters permit quick stock audits during opening and closing shifts.
3. **Requisition Slip Creation & Printing**:
   * Staff clicks **"New Stockroom Transfer"**, selecting the target station (`Bar / Café` or `Kitchen`), active shift (`Morning Opening`, `Mid-Day Rush`, `Evening Restock`), and requested items with transfer quantities.
   * Dynamic validation prevents transferring more units than are currently available in the central stockroom balance.
   * Upon dispatch, inventory balances update automatically, and the printable slip opens in a clean modal with a one-click **"Print Transfer Slip"** trigger executing browser print with dedicated `@media print` styling.
   * Historical slips are retained in a searchable **Transfer Slips Archive** for reprint and auditing.

### Visual Identity & Theme
* **Aesthetic Direction**: Clean, utilitarian workstation aesthetic tailored for busy café counters and kitchen tablets. High-contrast typography, clear tabular figures, and minimal distraction.
* **Color Palette**:
  * Canvas: Pure neutral slate (`#0F172A` / `#F8FAFC`).
  * Structural Surfaces: `#FFFFFF` with hairline borders (`#E2E8F0` / `#CBD5E1`).
  * Station Accents:
    * Café & Bar: Warm amber/coffee tone (`#78350F` / `#B45309`).
    * Kitchen: Terracotta/paprika tone (`#9A3412` / `#C2410C`).
    * Utility: Cool slate/steel tone (`#334155` / `#475569`).
* **Typography & Hierarchy**:
  * Display & Section Headers: `Plus Jakarta Sans` font family for crisp, modern headers.
  * Tabular & Numeric Data: Monospace tabular numerals (`font-mono tabular-nums`) for currency (PHP), stock balances, and quantities to ensure aligned decimals.
  * Metadata: Clean, unboxed text separated by typographic middots (`·`), strictly avoiding clunky static pill badges.
* **Interactive Feedback**:
  * High-visibility stock alerts with text badges (`Low Stock`, `Out of Stock`) paired with iconography.
  * Instant feedback toasts upon stock balance mutations.

***

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Client-Side Role Management with Quick PIN Verification
* **Chosen Approach**: Store active session role (`admin` or `employee`) in browser storage, backed by a 4-digit Manager PIN (`1234`) for elevated actions, with a rapid bypass option for demo and testing.
* **Why**: Allows instant switching between manager and employee perspectives without requiring external authentication servers or backend logins, perfect for shared counter tablets.
* **Alternatives Considered**: Mandatory user accounts with passwords — rejected as it creates severe friction during rapid café counter handovers.

### Decision 2: Native Browser Print Stylesheet vs. PDF Blob Generation
* **Chosen Approach**: Pure CSS `@media print` layout rendered via standard DOM and `window.print()`.
* **Why**: Near-instant print launch, zero external PDF dependencies (smaller bundle size), high fidelity, crisp thermal and laser printer rendering, and seamless cross-platform support.
* **Alternatives Considered**: Canvas-based PDF libraries (e.g. `jspdf`, `pdfmake`) — rejected due to heavy bundle bloat and font distortion on receipt printers.

### Decision 3: Atomic Stock Transfers with Audit History
* **Chosen Approach**: When a stock transfer is committed, the central stockroom balance is decremented immediately, a stock movement audit record (`STOCK_TRANSFER`) is logged, and a persistent `StockTransferSlip` record is stored with snapshot balances before and after.
* **Why**: Guarantees traceability so managers can audit discrepancies between inventory on paper and actual bar/kitchen stock.

***

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                               App.tsx                                  │
│             Role State: 'admin' | 'employee' (StorageService)          │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
    ┌───────────────▼───────────────┐  ┌─────────────▼──────────────────┐
    │          Navigation           │  │       AdminAccessGate          │
    │  Role Selector & Shift Bar    │  │  PIN Auth for Non-Inventory    │
    └───────────────┬───────────────┘  └────────────────────────────────┘
                    │
    ┌───────────────▼───────────────────────────────────────────────────┐
    │                      InventoryModule.tsx                          │
    │  - Department Filter: 'all' | 'cafe' | 'kitchen' | 'utility'      │
    │  - Stock Audit Table with Tabular Quantities                      │
    │  - Stock Adjustment & Delivery Intake Controls                   │
    └───────────────┬────────────────────────────────┬──────────────────┘
                    │                                │
    ┌───────────────▼──────────────┐   ┌─────────────▼──────────────────┐
    │     StockTransferModal       │   │  StockTransfersHistoryModal    │
    │  - Station: 'bar' | 'kitchen'│   │  - Searchable past slips       │
    │  - Multi-item selector       │   │  - Re-print slip capability    │
    │  - Balance limit validation  │   └─────────────┬──────────────────┘
    └───────────────┬──────────────┘                 │
                    │                                │
                    └────────────────┬───────────────┘
                                     │
                    ┌────────────────▼──────────────────┐
                    │      StockTransferPrintable       │
                    │  - Clean Requisition Slip Layout  │
                    │  - @media print CSS isolation     │
                    │  - Sign-off blocks (Staff/Mgr)    │
                    └───────────────────────────────────┘
```

### Data Model & State Extensions

* **`InventoryDepartment`**: `'cafe' | 'kitchen' | 'utility'` assigned to each `Ingredient`.
* **`UserRole`**: `'admin' | 'employee'` controlling active module view permissions.
* **`StockTransferSlip`**:
  ```ts
  interface StockTransferSlip {
    id: string;
    businessId: string;
    slipNumber: string; // e.g. TRF-2026-0042
    destination: 'bar' | 'kitchen';
    requestedBy: string;
    dispatchedBy: string;
    approvedBy?: string;
    shift: 'Morning Opening' | 'Mid-Day Rush' | 'Evening Restock';
    transferDate: string;
    items: StockTransferItem[];
    status: 'DISPATCHED' | 'RECEIVED' | 'DRAFT';
    createdAt: string;
  }
  ```

### Interactive Component & State Mapping
* **`Navbar`**: Displays current role status with quick switcher.
* **`AdminAccessGate`**: Intercepts confidential routes (Recipes, Cost Breakdown, Settings) when active role is `employee`.
* **`InventoryModule`**: Station tabs (`Café`, `Kitchen`, `Utility`), live search, threshold warnings, item count editor.
* **`StockTransferModal`**: Multi-item picker filtered by destination station, automated balance deduction, and voucher creation.
* **`StockTransferPrintable`**: Formats the voucher with business header, itemized quantities, and three physical signature blocks (*Requisitioned By*, *Dispatched By*, *Received & Verified By*).
* **`StockTransfersHistoryModal`**: Displays archive of issued vouchers with filtering and reprint triggers.
