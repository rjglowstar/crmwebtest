import { SocialMediaProvider } from "shared/businessobjects";
import { ExportColumn } from "shared/enitites";

export const listOriginItems: Array<string> = [
      "SuperAdmin",
      "Admin",
      "Supplier",
      "Customer",
      "Pricing",
      "Seller",
      "Accounts",
      "OPManager",
      "MFG",
      "Support"
];

export const invHistoryActions: Array<string> = [
      "StoneStatusInHold",
      "StoneStatusOrder",
      "StoneStatusUnHold",
      "StoneStatusStock",
      "StoneStatusIsRapnetHold",
      "IsPricingRequest",
      "TempPriceChanged",
      "DiscColorMarkChanged",
      "RapChangedByPrice",
      "PriceRequestChange",
      "InvDeleted"
]

export const listCustomerOriginItems: Array<string> = [
      "Customer",
      "Channel Partner"
];

export enum OriginValue {
      Admin = "Admin",
      Supplier = "Supplier",
      Customer = "Customer",
      Pricing = "Pricing",
      Seller = "Seller",
      Accounts = "Accounts",
      OPManager = "OPManager",
      MFG = "MFG"
}

export enum StatusValue {
      InProgress = "InProgress",
      Accepted = "Accepted",
      Rejected = "Rejected",
}

export enum TransactionType {
      Purchase = "Purchase",
      Sales = "Sales",
      General = "General",
      Payment = "Payment",
      Receipt = "Receipt",
      Contra = "Contra",
      Proforma = "Proforma",
      CreditNote = "CreditNote",
      DebitNote = "DebitNote"
}

export enum LedgerType {
      CashHandling = "CashHandling",
      Expense = "Expense",
      Interest = "Interest",
      LogisticCharge = "LogisticCharge"
}

export const listAddressTypeItems: Array<string> = [
      "Work",
      "Delivery",
      "Shipping",
      "Billing",
      "Other",
];

export const listOrgTypeItems: Array<string> = [
      "BLANK",
      "CORP",
      "HUF",
      "INC",
      "L.L.C",
      "LLC",
      "Ltd",
      "Other",
      "Partnership",
      "Proprietorship",
      "PVT LTD",
      "Pvt Ltd."
];

export const listBusinessTypeItems: Array<string> = [
      "BLANK",
      "E - Tailer(B2B)",
      "E - Tailer(B2C)",
      "Investor",
      "Jewellery Manufacturer",
      "Jewellery Retailer",
      "Other",
      "Personal",
      "Retailer",
      "Retailer(100 +)",
      "Retailer(10 - 100)",
      "Retailer(1 - 10)",
      "Watch",
      "Wholesaler",
      "Channel Partner"
];

export const listMembershipItems: Array<string> = [
      "AWDC",
      "BLANK",
      "CIBJO",
      "Diamond Federation of HK Ltd.",
      "GJEPC",
      "GJF",
      "GPT",
      "HKTDC",
      "Idex",
      "Israel Diamond Bource",
      "Other",
      "Rapnet",
      "SDE",
];

export const listBranchItems: Array<string> = [
      "Branch 1",
      "Branch 2",
      "Branch 3"
];

export const listSocialMediaProviderItems: Array<SocialMediaProvider> = [
      { mediaType: 'Networking', providerName: 'Facebook' },
      { mediaType: 'Networking', providerName: 'Twitter' },
      { mediaType: 'Networking', providerName: 'Skype' },
      { mediaType: 'Media_Sharing', providerName: 'Instagram' },
      { mediaType: 'Media_Sharing', providerName: 'Snapchat' },
      { mediaType: 'Discussion_Forum', providerName: 'Reddit' },
      { mediaType: 'Discussion_Forum', providerName: 'Quora' },
      { mediaType: 'Messaging', providerName: 'WhatsApp' },
      { mediaType: 'Networking', providerName: 'WeChat' },
      { mediaType: 'Networking', providerName: 'QQ' }
];

export const listShapeItems: Array<string> = [
      "ROUND",
      "FANCY"
];

export enum StoneStatus {
      Arrival = "Arrival",
      PWaiting = "P Waiting",
      Lab = "Lab",
      Pricing = "Pricing",
      Transit = "Transit",
      Stock = "Stock",
      Order = "Order",
      Sold = "Sold",
      Repair = "Repair",
      // Grading = "Grading",
      // InSale = "InSale",
      // Mfg = "Mfg"
}

export enum FrontStoneStatus {
      Stock = "Stock",
      Transit = "Transit",
      Order = "Order",
      Sold = "Sold",
      // Proposal = "Proposal",
      // InCart = "InCart",
      // Order = "Order",
      // Approved = "Approved",
      // IsDelivered = "IsDelivered",
      // Rejected = "Rejected",
}

export enum FrontOrderDetailStatus {
      Transit = "Transit",
      Order = "Order",
      Sold = "Sold"
      // Proposal = "Proposal",
      // InCart = "InCart",
      // Order = "Order",
      // Approved = "Approved",
      // IsDelivered = "IsDelivered",
      // Rejected = "Rejected",
}

export enum PricingStoneStatus {
      Arrival = "Arrival",
      Lab = "Lab",
      Stock = "Stock"
}

export enum LeadStatus {
      Qualification = "Qualification",
      Proposal = "Proposal",
      Cart = "Cart",
      Hold = "Hold",
      Order = "Order",
      // Approved = "Approved",
      Delivered = "Delivered",
      Rejected = "Rejected",
}

export enum LeadHistoryProggress {
      Created = "New Lead Created",
      ProposalToHold = "Move To Holding",
      HoldToOrder = "Move To Ordering",
      ProposalToRejected = "Move To Rejection",
      HoldToRejected = "Move To Rejection",
      OrderToRejected = "Move To Rejection",
      ProposalToOrder = "Move To Ordering",
      Delivered = "Move To Delivered"
}

export enum LeadHistoryProggressStatus {
      Created = "Proposal",
      ProposalToHold = "Hold",
      HoldToOrder = "Order",
      ProposalToRejected = "Rejected",
      HoldToRejected = "Rejected",
      OrderToRejected = "Rejected",
      ProposalToOrder = "Order",
      Delivered = "Delivered"
}

export const LeadStatusList: Array<string> = [
      "Proposal",
      "Hold",
      "Order",
      "Rejected",
]

export enum ExpoStatus {
      Pending = "Pending",
      Issue = "Issue",
      Received = "Received",
      Order = "Order"
}

export const listCustomerStoneStatus: Array<string> = [
      "Available",
      "Hold",
      "New"
];

export const listGrainingItems: Array<string> = [
      "Internal",
      "Surface"
];

export const listPriceRequestFilterTypeItems: Array<{ text: string; value: string }> = [
      { text: 'Inventory', value: 'Inv' },
      // { text: 'Pricing', value: 'Pricing' },
      { text: 'Temp Pricing', value: 'Temp' }
];

export const listExcelTypeItems: Array<string> = [
      "GIA-India",
      "GIA-Surat",
      "GIA-HK",
      "GIA-Tokyo",
      "GIA-BangKok",
      "GIA-NewYork",
      "GIA-Carlsbad",
      "HRD",
      "IGI",
];

export const listLabResultItems: Array<string> = [
      "GIA",
      "IGI",
      "HRD"
];

export enum FileStoreTypes {
      CustomerProfile = "CustomerProfile",
      CustomerPhotoIdent = "CustomerPhotoIdent",
      CustomerBussinessIdent = "CustomerBussinessIdent",
      EventImages = "EventImages",
      BrokerProfile = "BrokerProfile",
      BrokerExtraDocument = "BrokerExtraDocument"
}

export const stockOnHandExcelFormat: Array<{ text: string; value: string }> = [
      { text: 'NO', value: 'no' },
      { text: 'DATE', value: 'createdDate' },
      { text: 'STOCKID', value: 'stoneId' },
      { text: 'SHAPE', value: 'shape' },
      { text: 'WEIGHT', value: 'weight' },
      { text: 'COLOR', value: 'color' },
      { text: 'CLARITY', value: 'clarity' },
      { text: 'CUT', value: 'cut' },
      { text: 'POLISH', value: 'polish' },
      { text: 'SYMMETRY', value: 'symmetry' },
      { text: 'FLO', value: 'fluorescence' },
      { text: 'CertificateNo', value: 'certificateNo' },
      { text: 'COMMENT', value: 'comments' },
      { text: 'KTOS', value: 'inclusion.ktoS' },
      { text: 'SHADE', value: 'inclusion.shade' },
      { text: 'WIDTH', value: 'measurement.width' },
      { text: 'HEIGHT', value: 'measurement.height' },
      { text: 'RAP', value: 'price.rap' },
      { text: 'DISCOUNT', value: 'price.discount' },
      { text: 'PAR CR $', value: 'price.perCarat' },
      { text: 'PRICE $', value: 'price.netAmount' }
];

export const memoExportExcelFormat: Array<{ text: string; value: string }> = [
      { text: 'NO', value: 'no' },
      { text: 'MemoStatus', value: 'memoStatus' },
      { text: 'StoneId', value: 'stoneId' },
      { text: 'Kapan', value: 'kapan' },
      { text: 'Article', value: 'article' },
      { text: 'Shape', value: 'shape' },
      { text: 'Weight', value: 'weight' },
      { text: 'Color', value: 'color' },
      { text: 'Clarity', value: 'clarity' },
      { text: 'Cut', value: 'cut' },
      { text: 'Polish', value: 'polish' },
      { text: 'Symmetry', value: 'symmetry' },
      { text: 'Fluorescence', value: 'fluorescence' },
      { text: 'Table', value: 'measurement.table' },
      { text: 'Length', value: 'measurement.length' },
      { text: 'Width', value: 'measurement.width' },
      { text: 'Height', value: 'measurement.height' },
      { text: 'CrownHeight', value: 'measurement.crownHeight' },
      { text: 'CrownAngle', value: 'measurement.crownAngle' },
      { text: 'PavilionDepth', value: 'measurement.pavilionDepth' },
      { text: 'PavilionAngle', value: 'measurement.pavilionAngle' },
      { text: 'Girdleper', value: 'measurement.girdlePer' },
      { text: 'MinGirdle', value: 'measurement.minGirdle' },
      { text: 'MaxGirdle', value: 'measurement.maxGirdle' },
      { text: 'Ratio', value: 'measurement.ratio' },
      { text: 'Lab', value: 'lab' },
      { text: 'CertificateNo', value: 'certificateNo' },
      { text: 'FluorescenceColor', value: 'inclusion.flColor' },
      { text: 'KeytoSymbols', value: 'inclusion.ktoS' },
      { text: 'Inscription', value: 'inscription' },
      { text: 'BGMComments', value: 'bgmComments' },
      { text: 'Comments', value: 'comments' },
      { text: 'RAP', value: 'price.rap' },
      { text: 'DISCOUNT', value: 'price.discount' },
      { text: 'PAR CR $', value: 'price.perCarat' },
      { text: 'PRICE $', value: 'price.netAmount' },
      { text: 'CertiType', value: 'certiType' },
];

export const salesExportExcelFormat: Array<{ text: string; value: string }> = [
      { text: 'NO', value: 'no' },
      { text: 'StoneId', value: 'stoneId' },
      { text: 'Kapan', value: 'kapan' },
      { text: 'Article', value: 'article' },
      { text: 'Shape', value: 'shape' },
      { text: 'Weight', value: 'weight' },
      { text: 'Color', value: 'color' },
      { text: 'Clarity', value: 'clarity' },
      { text: 'Cut', value: 'cut' },
      { text: 'Polish', value: 'polish' },
      { text: 'Symmetry', value: 'symmetry' },
      { text: 'Fluorescence', value: 'fluorescence' },
      { text: 'Table', value: 'measurement.table' },
      { text: 'Length', value: 'measurement.length' },
      { text: 'Width', value: 'measurement.width' },
      { text: 'Height', value: 'measurement.height' },
      { text: 'CrownHeight', value: 'measurement.crownHeight' },
      { text: 'CrownAngle', value: 'measurement.crownAngle' },
      { text: 'PavilionDepth', value: 'measurement.pavilionDepth' },
      { text: 'PavilionAngle', value: 'measurement.pavilionAngle' },
      { text: 'Girdleper', value: 'measurement.girdlePer' },
      { text: 'MinGirdle', value: 'measurement.minGirdle' },
      { text: 'MaxGirdle', value: 'measurement.maxGirdle' },
      { text: 'Ratio', value: 'measurement.ratio' },
      { text: 'Lab', value: 'lab' },
      { text: 'CertificateNo', value: 'certificateNo' },
      { text: 'FluorescenceColor', value: 'inclusion.flColor' },
      { text: 'KeytoSymbols', value: 'inclusion.ktoS' },
      { text: 'Inscription', value: 'inscription' },
      { text: 'BGMComments', value: 'bgmComments' },
      { text: 'Comments', value: 'comments' },
      { text: 'CertiType', value: 'certiType' },
      { text: 'Rap', value: 'price.rap' },
      { text: 'Discount', value: 'price.discount' },
      { text: 'PerCT', value: 'price.perCarat' },
      { text: 'Amount', value: 'price.netAmount' },
      { text: 'Depth', value: 'measurement.depth' },
];

export const StockTallyRFIDFormat: Array<string> = [
      'Stock Found Stone',
      'Delivery Found Stone',
      'Not Found Stone',
      'Not Allocated',
];

export const StockSetupRFIDFormat: Array<string> = [
      'Found Stone',
      'Not Found Stone',
      'Allocated Stone',
      'Not Allocated Stone',
];

export const StockTallyRemainRFIDFormat: Array<string> = [
      'Remain Stone',
      'Memo Stone',
      'Lab Stone',
      'Transit Stone',
      'Order DP Stone',
      'Sold DP Stone',
      'Repair Stone',
      'Tallied Stone',
];

export const OrderExportFields: Array<string> = [
      'SALE DATE',
      'ORDER DATE',
      'Status',
      'STOCK',
      'SHAPE',
      'SIZE',
      'COLOR',
      'CLARITY',
      'CUT',
      'POLISH',
      'SYMMETRY',
      'FLO',
      'DIAMETER',
      'LAB',
      'CERTF',
      'CERTTYPE',
      'Dic%',
      'Net $',
      'VOW Disc',
      'VOW $',
      'RAP',
      '$/CT.',
      'Amt',
      'COMPANY',
      'COMPANY CODE',
      'Invoice No'
];

export const SalesExportFields: Array<string> = [
      'Supply Type',
      'Igst On Intra',
      'Blank1',
      'Igst On Intra2',
      'Document Type',
      'Document Number',
      'Document Date',
      'Buyer GSTIN',
      'Buyer Legal Name',
      'Buyer Trade Name',
      'Buyer POS',
      'Buyer Addr1',
      'Buyer Addr2',
      'Buyer Location',
      'Buyer PinCode',
      'Buyer State',
      'Blank2',
      'Blank3',
      'Blank4',
      'Blank5',
      'Blank6',
      'Blank7',
      'Blank8',
      'Blank9',
      'Buyer GSTIN2',
      'Buyer Legal Name2',
      'Buyer Trade Name2',
      'Buyer Addr12',
      'Buyer Addr22',
      'Buyer Location2',
      'Buyer PinCode2',
      'Buyer State2',
      'Sl.NO.',
      'Product Description',
      'Igst On Intra3',
      'HSN Code',
      'Blank10',
      'Quantity',
      'Blank11',
      'Unit',
      'Unit Price',
      'Gross Amount',
      'Discount',
      'Pre TaxValue',
      'Taxable Value',
      'GST Rate',
      'Sgst Amt',
      'Cgst Amt',
      'IGST Amt',
      'Cess Rate',
      'Cess Amt Adval',
      'Cess Non Amt Adval',
      'State Cess Rate',
      'State Cess Amt Adval',
      'State Cess Non Amt Adval',
      'Other Charges',
      'Item Total',
      'NoDigit1',
      'NoDigit2',
      'NoDigit3',
      'Value Total Taxable',
      'Value Sgst Amt',
      'Value Cgst Amt',
      'Value IGST Amt',
      'Value Cess Amt',
      'Value State Cess Amt',
      'Value Discount',
      'Value Other Charges',
      'Value Round off',
      'Value Total Invoice',
];

export const TransactionExportFields: Array<string> = [
      'TRANSACTION NO',
      'TRANSACTION TYPE',
      'INVOICE NO',
      'TRANSACTION DATE',
      'COMPANY',
      'WEIGHT',
      '$/CT.',
      'AMOUNT',
      'PAYMENT AMOUNT',
      'PAYMENT DATE',
      'PAID AMOUNT',
      'CC AMOUNT',
];

export const BrokrageExportFields: Array<string> = [
      'BROKER NAME',
      'BROKER AMOUNT',
      'BROKER CCAMOUNT',
      'BROKERAGE PERCENTAGE',
      'PARTY',
      'TRANSACTION NO',
      'TRANSACTION AMOUNT',
      'TRANSACTION NETAMOUNT',
      'TRANSACTION CCTYPE',
      'TRANSACTION CCRATE',
      'TRANSACTION DATE',
      'RECEIPT NO',
      'RECEIPT DATE',
      'PAID AMOUNT',
      'PAID DATE',
];

export const RFIDCLASSExportFields: Array<string> = [
      "RFID",
      "STONE ID",
      "WEIGHT",
      "STATUS"
];

export enum listCurrencyType {
      USD = "USD",
      HKD = "HKD",
      EURO = "EURO",
      JPY = "JPY",
      BAHT = "BAHT",
      INR = "INR",
      AED = "AED"
}

export enum listActionType {
      Recheck = "Recheck",
      Hold = "Hold",
      PRINT = "PRINT",
      ReportSleev = "Report Sleeve",
      InscribeAndPrint = "Inscribe and Print"
}

export enum listExportType {
      FOB = "FOB",
      CIF = "CIF",
      CFR = "CFR",
      CandI = "C&I"
}

export enum listInvoiceType {
      DIAMARTLOCAL = "DIAMARTLOCAL",
      DIAMARTOVERSEAS = "DIAMARTOVERSEAS",
      CGLOCAL = "CGLOCAL",
      CGOVERSEAS = "CGOVERSEAS"
}

export const listColorMarkItems: Array<string> = [
      "Yellow",
      "Red",
      "Blue",
      "Green",
      "Brown",
      "None"
];

export const listPartyTypeItems: Array<string> = [
      "Customer",
      "Boiler",
      "Photography",
];

export enum TextEnum {
      LedgerGroup = 'LedgerGroup',
      TaxType = 'TaxType',
      TransactGroup = 'TransactGroup',
      CurrencyType = 'CurrencyType',
      MemoProcess = 'MemoProcess'
}


export const listDesignationItems: Array<string> = [
      "It",
      "Manager",
      "Other"
];

export const listExportFormat: Array<string> = [
      "Excel",
      "Csv",
      "Json"
];

export const listCustomerFilterLocation: Array<string> = [
      "HK",
      "INDIA",
      "BELGIUM",
      "SHENZHEN"
];

export const listExportRequestFilterLocation: Array<string> = [
      "HK",
      "INDIA",
      "BELGIUM",
      "SHENZHEN",
      "UAE"
];

export const listBasicExportColumns: ExportColumn[] = [
      { title: 'StoneId', custTitle: '', value: 'stoneId', index: 0 },
      { title: 'Shape', custTitle: '', value: 'shape', index: 0 },
      { title: 'Weight', custTitle: '', value: 'weight', index: 0 },
      { title: 'Color', custTitle: '', value: 'color', index: 0 },
      { title: 'Clarity', custTitle: '', value: 'clarity', index: 0 },
      { title: 'Cut', custTitle: '', value: 'cut', index: 0 },
      { title: 'Polish', custTitle: '', value: 'polish', index: 0 },
      { title: 'symmetry', custTitle: '', value: 'symmetry', index: 0 },
      { title: 'Fluorescence', custTitle: '', value: 'fluorescence', index: 0 },
      { title: 'Lab', custTitle: '', value: 'lab', index: 0 },
      { title: 'Certificate No', custTitle: '', value: 'certificateNo', index: 0 },
      { title: 'Price', custTitle: '', value: 'price.rap', index: 0 },
      { title: 'Discount', custTitle: '', value: 'price.discount', index: 0 }
];

export const listIncusionExportColumns: ExportColumn[] = [
      { title: 'Brown', custTitle: '', value: 'inclusion.brown', index: 0 },
      { title: 'Green', custTitle: '', value: 'inclusion.green', index: 0 },
      { title: 'Milky', custTitle: '', value: 'inclusion.milky', index: 0 },
      { title: 'Shade', custTitle: '', value: 'inclusion.shade', index: 0 },
      { title: 'Side Black', custTitle: '', value: 'inclusion.sideBlack', index: 0 },
      { title: 'Center Black', custTitle: '', value: 'inclusion.centerBlack', index: 0 },
      { title: 'Side White', custTitle: '', value: 'inclusion.sideWhite', index: 0 },
      { title: 'Center White', custTitle: '', value: 'inclusion.centerWhite', index: 0 },
      { title: 'Open Crown', custTitle: '', value: 'inclusion.openCrown', index: 0 },
      { title: 'Open Table', custTitle: '', value: 'inclusion.openTable', index: 0 },
      { title: 'Open Pavilion', custTitle: '', value: 'inclusion.openPavilion', index: 0 },
      { title: 'Open Girdle', custTitle: '', value: 'inclusion.openGirdle', index: 0 },
      { title: 'Girdle Condition', custTitle: '', value: 'inclusion.girdleCondition', index: 0 },
      { title: 'EFOC', custTitle: '', value: 'inclusion.efoc', index: 0 },
      { title: 'EFOT', custTitle: '', value: 'inclusion.efot', index: 0 },
      { title: 'EFOG', custTitle: '', value: 'inclusion.efog', index: 0 },
      { title: 'EFOP', custTitle: '', value: 'inclusion.efop', index: 0 },
      { title: 'Culet', custTitle: '', value: 'inclusion.culet', index: 0 },
      { title: 'HNA', custTitle: '', value: 'inclusion.hna', index: 0 },
      { title: 'Eye Clean', custTitle: '', value: 'inclusion.eyeClean', index: 0 },
      { title: 'Key To Symbol', custTitle: '', value: 'inclusion.ktoS', index: 0 },
      { title: 'Natural On Table', custTitle: '', value: 'inclusion.naturalOnTable', index: 0 },
      { title: 'Natural On Girdle', custTitle: '', value: 'inclusion.naturalOnGirdle', index: 0 },
      { title: 'Natural On Crown', custTitle: '', value: 'inclusion.naturalOnCrown', index: 0 },
      { title: 'Natural On Pavillion', custTitle: '', value: 'inclusion.naturalOnPavillion', index: 0 },
      { title: 'Red Spot', custTitle: '', value: 'inclusion.redSpot', index: 0 },
      { title: 'Bow Tie', custTitle: '', value: 'inclusion.bowtie', index: 0 }
];

export const listMeasurementExportColumns: ExportColumn[] = [
      { title: 'Depth', custTitle: '', value: 'measurement.depth', index: 0 },
      { title: 'Table', custTitle: '', value: 'measurement.table', index: 0 },
      { title: 'Length', custTitle: '', value: 'measurement.length', index: 0 },
      { title: 'Width', custTitle: '', value: 'measurement.width', index: 0 },
      { title: 'Height', custTitle: '', value: 'measurement.height', index: 0 },
      { title: 'Crown Height', custTitle: '', value: 'measurement.crownHeight', index: 0 },
      { title: 'Crown Angle', custTitle: '', value: 'measurement.crownAngle', index: 0 },
      { title: 'Pavilion Depth', custTitle: '', value: 'measurement.pavilionDepth', index: 0 },
      { title: 'Pavilion Angle', custTitle: '', value: 'measurement.pavilionAngle', index: 0 },
      { title: 'Girdle Percentage', custTitle: '', value: 'measurement.girdlePer', index: 0 },
      { title: 'Min Girdle', custTitle: '', value: 'measurement.minGirdle', index: 0 },
      { title: 'Max Girdle', custTitle: '', value: 'measurement.maxGirdle', index: 0 },
      { title: 'Ratio', custTitle: '', value: 'measurement.ratio', index: 0 }
];

export const listOthersExportColumns: ExportColumn[] = [
      { title: 'Location', custTitle: '', value: 'location', index: 0 },
      { title: 'Availability', custTitle: '', value: 'isHold', index: 0 }
];

export const listLedgerGroupNatureItems: Array<string> = [
      "Liabilities",
      "Assets"
];

export enum IntlTelType {
      PrimaryMobile = "PrimaryMobils",
      SecondaryMobile = "SecondaryMobile",
      BusinessMobile = "BusinessMobile",
}

export enum ViewActionType {
      Video = "Video",
      Image = "Image",
      Certificate = "Certificate",
      VideoDownload = "VideoDownload",
}

export enum ViewActionImageType {
      Primary = "Primary",
      Heart = "Heart",
      Arrow = "Arrow",
}

export const listCompany: Array<string> = [
      "CG",
      "DM",
      "GS",
      "SD"
];

export const listPaymentType: Array<string> = [
      "Cash",
      "Cheque",
      "ET"
];

export const listETPaymentMethod: Array<string> = [
      "IMPS",
      "NEFT",
      "Online Transfer"
];

export enum TypeA {
      Type2A = "Type 2A",
      Type1A = "Type 1A",
      Type1AB = "Type 1AB"
}

export enum RejectionType {
      SaleCancel = "SaleCancel",
      OrderCancel = "OrderCancel",
      LeadReject = "LeadReject",
}

export enum listAnnounceType {
      AnnounceGlowstar = "announce_glowstar.jpg",
      AnnounceDiamarthk = "announce_diamarthk.jpg",
      AnnounceDiamanto = "announce_diamanto.jpg"
}

export enum InvHistoryAction {
      Hold = "Hold",
      UnHold = "UnHold",
      Order = "Order",
      Stock = "Stock",
      RapnetHold = "RapnetHold",
      RapnetUnHold = "RapnetUnHold",
      PricingRequest = "PricingRequest",
      TempPriceChanged = "TempPriceChanged",
      DiscColorMarkChanged = "DiscColorMarkChanged",
      RapChanged = "RapChanged",
      MainDiscChanged = "MainDiscChanged",
      PriceRequestChanged = "PriceRequestChanged",
      InvDeleted = "InvDeleted"
}

export enum LeadHistoryAction {
      LeadChangeParty = "LeadChangeParty",
      LeadStoneAdded = "LeadStoneAdded",
      AddDiscountChange = "AddDiscountChange",
      VolumeDiscountChange = "VolumeDiscountChange",
      LeadStoneDeleted = "LeadStoneDeleted",
      BrokerDeleted = "BrokerDeleted",
      BrokerUpdated = "BrokerUpdated",
      BrokerAdded = "BrokerAdded",
      QcCriteriaUpdated = "QcCriteriaUpdated",
      QcCriteriaAdded = "QcCriteriaAdded",
      MemoRequest = "MemoRequest",
      OrderCancel = "OrderCancel",
      SaleCancel = "SaleCancel",
      ExportRequest = "ExportRequest",
      QcRequest = "QcRequest",
      StoneStatusOrder = "StoneStatusOrder",
      HoldToOrder = "HoldToOrder",
      HoldToRejected = "HoldToRejected"
}

export enum AlertIcon {
      Delete = 'icon-delete_new',
      Cart = 'icon-cart_btn',
      Watchlist = 'icon-watchlist_new_btn',
      Order = 'icon-orderNew_btn',
      Success = 'icon-success_new',
      Error = 'icon-erroricon',
      NotFound = 'icon-erroricon'
}
