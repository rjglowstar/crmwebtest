import { Injectable } from "@angular/core";
import { NavPanelItem, PermissionItem } from "shared/businessobjects";

@Injectable()
export class NavigationService {

    constructor() { }

    getNavPanelItems(): NavPanelItem[] {
        return [
            {
                name: "Organization",
                path: "",
                icon: "mOrganization",
                items: [
                    { name: "Profile", path: "/profile", icon: "admins.svg", items: [] },
                    { name: "Organizations", path: "/organization", icon: "candidates.svg", items: [] },
                    { name: "Employee", path: "/employee", icon: "employee.svg", items: [] },
                    { name: "User", path: "/user", icon: "admins.svg", items: [] }
                ]
            },
            {
                name: "Inventory",
                path: "",
                icon: "inventroy",
                items: [
                    { name: "Inventory Arrival", path: "/inventoryupload", icon: "inventoryupload.svg", items: [] },
                    { name: "Inclusion Upload", path: "/inclusionupload", icon: "inclusionupload.svg", items: [] },
                    { name: "Grading", path: "/grading", icon: "grading.svg", items: [] },
                    { name: "Inventory", path: "/inventory", icon: "inventory.svg", items: [] },
                    { name: "Memo", path: "/memomaster", icon: "memo.svg", items: [] },
                    { name: "Memo Request", path: "/memorequest-master", icon: "memo.svg", items: [] },
                    { name: "Qc Request", path: "/qcrequest-master", icon: "qc-request.svg", items: [] },
                    { name: "Order", path: "/order", icon: "order.svg", items: [] },
                    { name: "Inward Memo", path: "/inwardmemo", icon: "inward.svg", items: [] },
                    { name: "Inward Memo Return", path: "/memoreturn", icon: "memoreturn.svg", items: [] },
                    { name: "Stone Media", path: "/stonemedia", icon: "stonemedia.svg", items: [] },
                    { name: "Repairing", path: "/repairing", icon: "repairing.svg", items: [] },
                    { name: "Notification", path: "/notifications", icon: "notification.svg", items: [] },
                    { name: "Export Request", path: "/exportrequest", icon: "export-request.svg", items: [] },
                ]
            },
            {
                name: "Lab",
                path: "",
                icon: "mLab",
                items: [
                    { name: "Lab Master", path: "/lab", icon: "labresult.svg", items: [] },
                    { name: "Lab Expense", path: "/labexpense", icon: "labexpense.svg", items: [] },
                    { name: "Lab Issue Receive", path: "/labissuemaster", icon: "lab.svg", items: [] },
                    { name: "Lab Service", path: "/labservice", icon: "labconfig.svg", items: [] },
                    { name: "Lab Result Upload", path: "/labreconsiliation", icon: "labresultupload.svg", items: [] }
                ]
            },
            {
                name: "RFID",
                path: "",
                icon: "mRfid",
                items: [
                    { name: "RFID Stock", path: "/rfid", icon: "stock-rfid.svg", items: [] },
                    { name: "RFID StockTally", path: "/rfid/rfidstocktally", icon: "stocktally.svg", items: [] },
                ]
            },
            {
                name: "Account",
                path: "",
                icon: "mAccounting",
                items: [
                    { name: "Company Master", path: "/companymaster", icon: "company-master.svg", items: [] },
                    { name: "Logistic Master", path: "/logisticsmaster", icon: "logisticsmaster.svg", items: [] },
                    { name: "Transact Item", path: "/transactitem", icon: "transact-master.svg", items: [] },
                    { name: "Ledger", path: "/ledger", icon: "ledger.svg", items: [] },
                    { name: "Ledger Summary", path: "/ledgersummary", icon: "analysis.svg", items: [] },
                    { name: "Balance Sheet", path: "/balancesheet", icon: "balancesheet.svg", items: [] },
                    { name: "Profit & Loss", path: "/profitloss", icon: "profitloss.svg", items: [] },
                    { name: "Transactions", path: "/transactions", icon: "purchase.svg", items: [] },
                    { name: "Brokerage", path: "/brokerage-master", icon: "brokerage.svg", items: [] },
                    { name: "Cheque", path: "/cheque", icon: "cheque.svg", items: [] },
                ]
            },
            {
                name: "Configuration",
                path: "",
                icon: "mConfiguration",
                items: [
                    { name: "Origin Configuration", path: "/configuration", icon: "configuration.svg", items: [] },
                    { name: "Master Configuration", path: "/masterconfig", icon: "masterconfig.svg", items: [] },
                    { name: "Account Configuration", path: "/accountconfig", icon: "accountconfig.svg", items: [] },
                    // { name: "Scheme Configuration", path: "/schememaster", icon: "scheme.svg", items: [] },
                ]
            },
            {
                name: "Analysis",
                path: "",
                icon: "mAnalysis",
                items: [
                    { name: "Kapan Analysis", path: "/kapananalysis", icon: "analysis.svg", items: [] },
                    { name: "Weekly Summary", path: "/weeklysummary", icon: "weeklysummary.svg", items: [] },
                    { name: "Reports", path: "/reports", icon: "reports.svg", items: [] },
                ]
            },
        ]
    }

    getPermissionItem(): PermissionItem[] {
        return [
            {
                name: "Employee",
                items: [
                    { name: "CanDeleteEmployee", items: [] }
                ]
            },
            {
                name: "Inventory Arrival",
                items: [
                    { name: "CanAddInvArrival", items: [] },
                    { name: "CanDeleteInvArrival", items: [] }
                ]
            },
            {
                name: "Inventory",
                items: [
                    { name: "CanIssueInventory", items: [] },
                    { name: "CanEditInventory", items: [] },
                    { name: "CanNonCertiInventory", items: [] },
                    { name: "CanLabIssueInventory", items: [] },
                    { name: "CanMemoIssueInventory", items: [] },
                    { name: "CanDeleteInventory", items: [] },
                ]
            },
            {
                name: "Memo",
                items: [
                    { name: "CanReceiveMemo", items: [] }
                ]
            },
            {
                name: "Memo Request",
                items: [
                    { name: "CanDeleteMemo", items: [] }
                ]
            },
            {
                name: "Order",
                items: [
                    { name: "CanDelivered", items: [] }
                ]
            },
            {
                name: "Ledger",
                items: [
                    { name: "CanDeleteLedger", items: [] }
                ]
            },
            {
                name: "Transactions",
                items: [
                    { name: "CanDeleteTransactions", items: [] }
                ]
            },
            {
                name: "RFID Setup",
                items: [
                    { name: "CanAccessSetupButtons", items: [] }
                ]
            },
            {
                name: "RFID StockTally",
                items: [
                    { name: "CanAccessStockTallyButtons", items: [] }
                ]
            }
            ,
            {
                name: "Memo Return",
                items: [
                    { name: "CanDeleteMemoReturn", items: [] }
                ]
            }
        ]
    }
}