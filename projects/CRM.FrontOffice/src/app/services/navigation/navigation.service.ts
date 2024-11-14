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
                    { name: "Profile", path: "/profile", icon: "admins.svg", items: [], isAdmin: true },
                    { name: "Supplier", path: "/supplier", icon: "logisticsmaster.svg", items: [], isAdmin: true },
                    { name: "System User", path: "/systemuser", icon: "systemuser.svg", items: [], isAdmin: true },
                    { name: "Customer Verification", path: "/customerverification", icon: "candidates.svg", items: [], isAdmin: true },
                    { name: "Broker", path: "/broker", icon: "broker.svg", items: [], isAdmin: true },
                    { name: "Customer", path: "/customer", icon: "candidates.svg", items: [], isAdmin: true },
                    { name: "Expo Master", path: "/expomaster", icon: "expo.svg", items: [], isAdmin: true },
                    { name: "FTP Add.Disc", path: "/ftpaddisc", icon: "expo.svg", items: [], isAdmin: true },
                ],
                isAdmin: true
            },
            {
                name: "Inventory",
                path: "",
                icon: "inventroy",
                items: [
                    { name: "Inventory", path: "/inventory", icon: "inventory.svg", items: [], isAdmin: true },
                    { name: "Lead", path: "/lead", icon: "lead.svg", items: [], isAdmin: true },
                    { name: "Lead Detail", path: "/leaddetails", icon: "lead.svg", items: [], isAdmin: true },
                    { name: "Memo Request", path: "/memorequest-master", icon: "memo.svg", items: [], isAdmin: true },
                    { name: "Qc Request", path: "/qcrequest-master", icon: "qc-request.svg", items: [], isAdmin: true },
                    { name: "Order", path: "/order", icon: "order.svg", items: [], isAdmin: true },
                    { name: "Order Detail", path: "/orderdetail", icon: "order.svg", items: [], isAdmin: true },
                    // { name: "Rejecetd Stone", path: "/rejcetedstones", icon: "rejectedstones.svg", items: [], isAdmin: true },
                    { name: "Lead Rejecetd Stone", path: "/rejcetedstonesmaster", icon: "rejectedstones.svg", items: [], isAdmin: true },
                    { name: "Watchlist", path: "/watchlist", icon: "wishlist.svg", items: [], isAdmin: true },
                    { name: "Cart", path: "/cart", icon: "cart.svg", items: [], isAdmin: true },
                    { name: "Stone Media", path: "/stonemedia", icon: "stonemedia.svg", items: [], isAdmin: true },
                    { name: "Notification", path: "/notifications", icon: "notification.svg", items: [], isAdmin: true },
                    { name: "Expo Inventory", path: "/expoinventory", icon: "expo.svg", items: [], isAdmin: true },
                    { name: "Expo Inquiries", path: "/exporequest", icon: "view-request.svg", items: [], isAdmin: true },
                ],
                isAdmin: true
            },
            {
                name: "Pricing",
                path: "",
                icon: "mPricing",
                items: [
                    { name: "Pricing Request", path: "/requestprice", icon: "pricingrequest.svg", items: [], isAdmin: true },
                    { name: "Inventory Price", path: "/inventoryprice", icon: "inventory.svg", items: [], isAdmin: true },
                    { name: "Inventory Price New", path: "/inventorypricev2", icon: "inventory.svg", items: [], isAdmin: true },
                    { name: "Pricing Config", path: "/pricingconfig", icon: "pricngconfig.svg", items: [], isAdmin: true },
                    { name: "Special Stone", path: "/specialstone", icon: "stone.svg", items: [], isAdmin: true },
                    { name: "Pending Pricing", path: "/pendingpricing", icon: "pending-pricing.svg", items: [], isAdmin: true },
                    { name: "Sales Sheet", path: "/salessheet", icon: "sales-sheet.svg", items: [], isAdmin: true },
                ],
                isAdmin: true
            },
            {
                name: "Support",
                path: "",
                icon: "mSupport",
                items: [
                    { name: "Suggestion", path: "/suggestionlist", icon: "suggestions.svg", items: [], isAdmin: true },
                    { name: "Appointment List", path: "/appointmentlist", icon: "manageappointment.svg", items: [], isAdmin: true },
                    { name: "Event Management", path: "/event", icon: "eventmanagement.svg", items: [], isAdmin: true },
                    { name: "Recommended", path: "/recommended", icon: "recommenddiamond.svg", items: [], isAdmin: true },
                ],
                isAdmin: true
            },
            {
                name: "Analysis",
                path: "",
                icon: "mAnalysis",
                items: [
                    // { name: "Geo Tracking", path: "/geotracking", icon: "gpslabour.svg", items: [], isAdmin: true },
                    { name: "Search History", path: "/searchhistory", icon: "searchhistory.svg", items: [], isAdmin: true },
                    { name: "Login History", path: "/loginhistory", icon: "loginhistory.svg", items: [], isAdmin: true },
                    { name: "Lead History", path: "/leadhistory", icon: "leadhistory.svg", items: [], isAdmin: true },
                    { name: "Inventory History", path: "/inventoryhistory", icon: "stone.svg", items: [], isAdmin: true },
                    { name: "Vow Statistic", path: "/vowstatistic", icon: "vowstatistic.svg", items: [], isAdmin: true },
                    { name: "Purchase Analysis", path: "/purchaseanalysis", icon: "analysis.svg", items: [], isAdmin: true },
                    { name: "Kapan Compare", path: "/kapancompare", icon: "analysis.svg", items: [], isAdmin: true },
                    { name: "Lead Analysis", path: "/leadanalysis", icon: "lead.svg", items: [], isAdmin: true },
                    { name: "Offer Stone", path: "/offerstone", icon: "stone.svg", items: [], isAdmin: true },
                    { name: "Sale Analysis", path: "/saleanalysis", icon: "analysis.svg", items: [], isAdmin: true },
                ],
                isAdmin: true
            },
            {
                name: "Bid",
                path: "",
                icon: "bid",
                items: [
                    { name: "Biding Upload", path: "/bidingupload", icon: "bid.svg", items: [], isAdmin: true },
                    { name: "Biding Results", path: "/bidingresults", icon: "bid.svg", items: [], isAdmin: true },
                    { name: "Biding History", path: "/bidinghistory", icon: "bid.svg", items: [], isAdmin: true }
                ],
                isAdmin: true
            },
            {
                name: "Configuration",
                path: "",
                icon: "mConfiguration",
                items: [
                    { name: "Configuration", path: "/configuration", icon: "configuration.svg", items: [], isAdmin: true },
                    { name: "Master config", path: "/masterconfig", icon: "masterconfig.svg", items: [], isAdmin: true },
                    { name: "Rap Upload", path: "/rapupload", icon: "rapprice.svg", items: [], isAdmin: true },
                    { name: "Scheme Configuration", path: "/schememaster", icon: "scheme.svg", items: [], isAdmin: true },
                    { name: "Business Configuration", path: "/businessconfig", icon: "businessconfig.svg", items: [], isAdmin: true }
                ],
                isAdmin: true
            },
            {
                name: "View Inventory",
                path: "",
                icon: "inventory.svg",
                items: [
                    { name: "Current Inventory", path: "/currentinventory", icon: "inventory.svg", items: [], isAdmin: false },
                    { name: "Kapan Summary", path: "/kapansummary", icon: "weeklysummary.svg", items: [], isAdmin: false },
                    { name: "View Kapan Compare", path: "/kapancompare", icon: "kapans.svg", items: [], isAdmin: false },
                ],
                isAdmin: false
            },
            {
                name: "Accounting",
                path: "",
                icon: "accounting.svg",
                items: [
                    { name: "Payment Statistic", path: "/paymentstatistic", icon: "sellerperfomance.svg", items: [], isAdmin: false },
                    { name: "Kapan Price", path: "/kapanprice", icon: "kapans.svg", items: [], isAdmin: false },
                    { name: "Intra Sales", path: "/intrasales", icon: "sellerperfomance.svg", items: [], isAdmin: false },
                    { name: "SalesCancel Report", path: "/salescancel", icon: "reports.svg", items: [], isAdmin: false }
                ],
                isAdmin: false
            },
            {
                name: "View Analysis",
                path: "",
                icon: "accounting.svg",
                items: [
                    { name: "Sell Difference", path: "/selldifference", icon: "inventory.svg", items: [], isAdmin: false },
                    { name: "Sales Statics", path: "/salesstatics", icon: "sellerperfomance.svg", items: [], isAdmin: false },
                    { name: "KapanLab Results", path: "/kapanlabresult", icon: "lab.svg", items: [], isAdmin: false },
                    { name: "Market Analysis", path: "/marketanalysis", icon: "lab.svg", items: [], isAdmin: false }
                ],
                isAdmin: false
            },
        ]
    }

    getPermissionItem(): PermissionItem[] {
        return [
            {
                name: "Customer Verification",
                items: [
                    { name: "CanAddCustomer", items: [] },
                    { name: "CanApproveCustomer", items: [] }
                ]
            },
            {
                name: "Customer",
                items: [
                    { name: "CanEditCustomer", items: [] },
                    { name: "CanDeleteCustomer", items: [] }
                ]
            },
            {
                name: "Inventory",
                items: [
                    { name: "CanHoldInventory", items: [] },
                    { name: "CanReleaseHoldInventory", items: [] },
                    { name: "CanRapnetHoldInventory", items: [] },
                    { name: "CanRapnetReleaseHoldInventory", items: [] },
                    { name: "CanUpdateInventoryCut", items: [] }
                ]
            },
            {
                name: "RapUpload",
                items: [
                    { name: "CanApplyRapUpload", items: [] }
                ]
            },
            {
                name: "Sales Sheet",
                items: [
                    { name: "Can Show Pary Name", items: [] }
                ]
            }
        ]
    }

}