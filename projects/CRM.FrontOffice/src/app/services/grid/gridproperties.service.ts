import { Injectable } from "@angular/core";
import { GridDetailConfig } from "shared/businessobjects";

@Injectable()

export class GridPropertiesService {

    constructor() { }

    public getSystemUserGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "fullName", title: "Full Name", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "origin", title: "Origin", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "email", title: "Email", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "mobile", title: "Mobile No", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "address.line1", title: "Address", width: 250, sortOrder: i++, isSelected: true },
            { propertyName: "joiningDate", title: "Join Date", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "enrollmentNumber", title: "Enroll Number", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "isManager", title: "Is Manager", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "isActive", title: "Active", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "isAvailable", title: "Available", width: 100, sortOrder: i++, isSelected: true }
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getSupplierGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "name", title: "Name", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "incomeTaxNo", title: "IncomeTaxno", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "taxNo", title: "TaxNo", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "membership", title: "Membership", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "address.line1", title: "Address", width: 250, sortOrder: i++, isSelected: true },
            { propertyName: "website", title: "Website", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "person", title: "Person", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "email", title: "Email", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "mobileNo", title: "MobileNo", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "phoneNo", title: "PhoneNo", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "faxNo", title: "FaxNo", width: 100, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getPendingPriceGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "media", title: "Media", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "Kapan", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.discount", title: "Base Disc", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Main Disc", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "tempPrice.discount", title: "T. Main Disc", width: 100, sortOrder: i++, isSelected: true, editor: 'numeric' },
            { propertyName: "discDiff", title: "Disc Diff", width: 100, sortOrder: i++, isSelected: true, editor: 'numeric' },
            { propertyName: "basePrice.netAmount", title: "Base NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.perCarat", title: "Base $/CT", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "lab", title: "Lab", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.iGrade", title: "IGrade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.mGrade", title: "MGrade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "days", title: "Days", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "Diameter", title: "Diameter", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.depth", title: "Depth% / Total Depth", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.table", title: "Table", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "Natts", title: "Natts", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "ratio", title: "Ratio", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "Girdle", title: "Girdle", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.ktoS", title: "KtoS", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.brown", title: "Brown", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.green", title: "Green", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.milky", title: "Milky", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.shade", title: "Shade", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created At", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "updatedAt", title: "Updated At", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "comments", title: "Comments", width: 80, sortOrder: i++, isSelected: true }]

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getStoneAnalysisGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.discount", title: "Base Disc", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Disc", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "fDiscount", title: "F.Disc", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "orderDate", title: "Order Date", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.iGrade", title: "IGrade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.mGrade", title: "MGrade", width: 80, sortOrder: i++, isSelected: true },

            { propertyName: "Diameter", title: "Diameter", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.depth", title: "Depth", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.table", title: "Table", width: 80, sortOrder: i++, isSelected: true },

            { propertyName: "inclusion.culet", title: "Culet", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.brown", title: "Brown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.green", title: "Green", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.milky", title: "Milky", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.shade", title: "Shade", width: 80, sortOrder: i++, isSelected: true },

            { propertyName: "lab", title: "Lab", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "availableDays", title: "Avai. Days", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "days", title: "Days", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.ratio", title: "Ratio", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "pricingComment", title: "P. Comment", width: 80, sortOrder: i++, isSelected: true }
        ]

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getPriceRequestGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "analytic", title: "Analytic", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "media", title: "Media", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "CertificateNo", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "Kapan", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shapeRemark", title: "S_Remark", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.discount", title: "Base Disc", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "tempBaseDisc", title: "T. Base Disc", width: 100, sortOrder: i++, isSelected: true, editor: 'numeric' },
            { propertyName: "price.discount", title: "Main Disc", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "tempDisc", title: "T. Main Disc", width: 100, sortOrder: i++, isSelected: true, editor: 'numeric' },
            { propertyName: "discountOne", title: "Discount1", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "discountTwo", title: "Discount2", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "discountThree", title: "Discount3", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.netAmount", title: "Base NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.perCarat", title: "Base $/CT", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "lab", title: "Lab", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.iGrade", title: "IGrade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.mGrade", title: "MGrade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "days", title: "Days", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "Diameter", title: "Diameter", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.depth", title: "Depth% / Total Depth", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.table", title: "Table", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "Natts", title: "Natts", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.ratio", title: "Ratio", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "Girdle", title: "Girdle", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.ktoS", title: "KtoS", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.brown", title: "Brown", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.green", title: "Green", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.milky", title: "Milky", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.shade", title: "Shade", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Pricing Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "expiryDate", title: "Expiry Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "typeA", title: "TypeA", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "availableDays", title: "A. Days", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "requestedBy", title: "Req. By", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "comments", title: "Comments", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "isDOrder", title: "Order", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "pricingComment", title: "P. Comment", width: 80, sortOrder: i++, isSelected: true }]

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getInventoryPriceGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "analytic", title: "Analytic", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "media", title: "Media", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "StoneId" },
            { propertyName: "certificateNo", title: "CertificateNo", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "CertificateNo" },
            { propertyName: "kapan", title: "Kapan", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Kapan" },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Shape" },
            { propertyName: "shapeRemark", title: "S_Remark", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Weight" },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Color" },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Clarity" },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Cut" },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Polish" },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Symmetry" },
            { propertyName: "fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Fluorescence" },
            { propertyName: "status", title: "Status", width: 120, sortOrder: i++, isSelected: true, sortFieldName: "Status" },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Price.Rap" },
            { propertyName: "basePrice.discount", title: "Base Disc", width: 100, sortOrder: i++, isSelected: true, sortFieldName: "BasePrice.Discount" },
            { propertyName: "price.discount", title: "Main Disc", width: 100, sortOrder: i++, isSelected: true, sortFieldName: "Price.Discount" },
            { propertyName: "tempDisc", title: "T. Main Disc", width: 100, sortOrder: i++, isSelected: true, editor: 'numeric' },
            { propertyName: "discDiff", title: "Disc Diff", width: 100, sortOrder: i++, isSelected: true, editor: 'numeric' },
            { propertyName: "discountOne", title: "Discount1", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "discountTwo", title: "Discount2", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "discountThree", title: "Discount3", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.netAmount", title: "Base NetAmount", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "BasePrice.NetAmount" },
            { propertyName: "basePrice.perCarat", title: "Base $/CT", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "BasePrice.PerCarat" },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Price.NetAmount" },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Price.PerCarat" },
            { propertyName: "lab", title: "Lab", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Lab" },
            { propertyName: "inclusion.iGrade", title: "IGrade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.mGrade", title: "MGrade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "days", title: "Days", width: 60, sortOrder: i++, isSelected: true, sortFieldName: "Days" },
            { propertyName: "Diameter", title: "Diameter", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.depth", title: "Depth% / Total Depth", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.table", title: "Table", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "Natts", title: "Natts", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.ratio", title: "Ratio", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "Girdle", title: "Girdle", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.ktoS", title: "KtoS", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.brown", title: "Brown", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.green", title: "Green", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.milky", title: "Milky", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.shade", title: "Shade", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "isMemo", title: "Memo", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "isHold", title: "Hold", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "isRapnetHold", title: "Rapnet Hold", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "marketSheetDate", title: "Marketsheet Date", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "MarketSheetDate" },
            { propertyName: "priceUpdatedAt", title: "Price Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "isLabReturn", title: "IsLabReturn", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "typeA", title: "TypeA", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "availableDays", title: "A. Days", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "AvailableDays" },
            { propertyName: "comments", title: "Comments", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "holdDate", title: "Hold Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "holdBy", title: "Hold By", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "isDOrder", title: "Order", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "pricingComment", title: "P. Comment", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "PricingComment" }]

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getInventoryGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "media", title: "Media", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "StoneId" },
            { propertyName: "kapan", title: "Kapan", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Kapan" },
            { propertyName: "rfid", title: "RFID No", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Rfid" },
            { propertyName: "grade", title: "Grade", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Grade" },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Shape" },
            { propertyName: "shapeRemark", title: "S_Remark", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Weight" },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Color" },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Clarity" },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Cut" },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Polish" },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Symmetry" },
            { propertyName: "fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Fluorescence" },
            { propertyName: "measurement", title: "Messurement", width: 125, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.depth", title: "Depth %", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.table", title: "Table %", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Price.Rap" },
            { propertyName: "basePrice.discount", title: "Base Disc", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Main Disc", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Price.NetAmount" },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Price.PerCarat" },
            { propertyName: "location", title: "Location", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Location" },
            { propertyName: "status", title: "Status", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Status" },
            { propertyName: "memoProcess", title: "Memo Proc.", width: 100, sortOrder: i++, isSelected: true, sortFieldName: "MemoProcess" },
            { propertyName: "leadStatus", title: "Lead Status", width: 100, sortOrder: i++, isSelected: true, sortFieldName: "LeadStatus" },
            { propertyName: "isInExpo", title: "Expo", width: 35, sortOrder: i++, isSelected: true, sortFieldName: "IsInExpo" },
            { propertyName: "expoName", title: "Expo Name", width: 35, sortOrder: i++, isSelected: true, sortFieldName: "ExpoName" },
            { propertyName: "isMemo", title: "Memo", width: 35, sortOrder: i++, isSelected: true, sortFieldName: "IsMemo" },
            { propertyName: "isHold", title: "Hold", width: 35, sortOrder: i++, isSelected: true, sortFieldName: "IsHold" },
            { propertyName: "holdBy", title: "Hold By", width: 35, sortOrder: i++, isSelected: true, sortFieldName: "HoldBy" },
            { propertyName: "isRapnetHold", title: "Rapnet Hold", width: 35, sortOrder: i++, isSelected: true, sortFieldName: "IsRapnetHold" },
            { propertyName: "isCPBlocked", title: "IsCPBlocked", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "IsCPBlocked" },
            { propertyName: "isLabReturn", title: "IsLabReturn", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "IsLabReturn" },
            { propertyName: "isPricingRequest", title: "IsPricingRequest", width: 30, sortOrder: i++, isSelected: true, sortFieldName: "IsPricingRequest" },
            { propertyName: "lab", title: "Lab", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Lab" },
            { propertyName: "certificateNo", title: "Certificate No", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "CertificateNo" },
            { propertyName: "inscription", title: "Inscription", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Inscription" },
            { propertyName: "comments", title: "Lab Comments", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Comments" },
            { propertyName: "expoRemark", title: "Remark", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Remark" },
            { propertyName: "bgmComments", title: "BGM Comments", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "BgmComments" },
            { propertyName: "pricingComment", title: "P.Comment", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "PricingComment" },
            { propertyName: "marketSheetDate", title: "MarketSheetDays", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "MarketSheetDate" },
            { propertyName: "inclusion.shade", title: "Shade", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Inclusion.Shade" },
            { propertyName: "inclusion.brown", title: "Brown", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Inclusion.Brown" },
            { propertyName: "inclusion.green", title: "Green", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Inclusion.Green" },
            { propertyName: "inclusion.milky", title: "Milky", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Inclusion.Milky" },
            { propertyName: "inclusion.centerBlack", title: "BlackTable", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Inclusion.CenterBlack" },
            { propertyName: "inclusion.sideBlack", title: "BlackCrown", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Inclusion.SideBlack" },
            { propertyName: "inclusion.culet", title: "Culet", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "Inclusion.Culet" },
            { propertyName: "typeA", title: "TypeA", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "typeA" },
            { propertyName: "availableDays", title: "Avai. Days", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "AvailableDays" },
            { propertyName: "inclusion.iGrade", title: "IGrade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapanOrigin", title: "Kapan Origin", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "KapanOrigin" },
            { propertyName: "measurement.mGrade", title: "MGrade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "isDOrder", title: "Order", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "holdBy", title: "Hold By", width: 80, sortOrder: i++, isSelected: true },

        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getBrokerGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "name", title: "Name", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "code", title: "Code", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "brokrage", title: "Brokrage %", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "incomeTaxNo", title: "Income Tax", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "email", title: "Email", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "mobileNo", title: "Mobile No", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "address", title: "Address", width: 200, sortOrder: i++, isSelected: true },
            { propertyName: "refCompanyName", title: "Ref Company", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "refPersonName", title: "Ref Person", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "refemail", title: "Ref Email", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "refmobileNo", title: "Ref Mobile No", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "refAddress", title: "Ref Address", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "isActive", title: "Active", width: 70, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getCustomerGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "companyName", title: "Company Name", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "CompanyName" },
            { propertyName: "fullName", title: "FullName", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "FullName" },
            { propertyName: "origin", title: "Origin", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "birthDate", title: "Birth Date", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "primaryMobile", title: "Mobile No", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "email", title: "Email", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "createdBy", title: "CreatedBy", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "seller.name", title: "Seller", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "phoneNo", title: "Telephone No", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "designation", title: "Designation", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "businessType", title: "Business Type", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "businessEmail", title: "Business Email", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "businessMobileNo", title: "BusinessMobile No", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "businessPhoneNo", title: "BusinessPhone No", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "businessDate", title: "Business Date", width: 130, sortOrder: i++, isSelected: true, sortFieldName: "BusinessDate" },
            { propertyName: "renewDate", title: "Renew Date", width: 130, sortOrder: i++, isSelected: true, sortFieldName: "RenewDate" },
            { propertyName: "address.line1", title: "Address", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "address.country", title: "Country", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "address.zipCode", title: "Postal Code", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "faxNo", title: "Fax", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "referenceName", title: "Reference", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "cartExpireHour", title: "Cart Expire Hour", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Regist.Date", width: 120, sortOrder: i++, isSelected: true, sortFieldName: "CreatedDate" },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getCustomerAddDiscGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 85, sortOrder: i++, isSelected: true, sortFieldName: "StoneId" },
            { propertyName: "companyName", title: "Company Name", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "CompanyName" },
            { propertyName: "type", title: "Type", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Type" },
            { propertyName: "shape", title: "Shape", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Shape" },
            { propertyName: "weight", title: "Weight", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Weight" },
            { propertyName: "color", title: "Color", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Color" },
            { propertyName: "clarity", title: "Clarity", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Clarity" },
            { propertyName: "cut", title: "Cut", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Cut" },
            { propertyName: "polish", title: "Polish", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Polish" },
            { propertyName: "symmetry", title: "Symmetry", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Symmetry" },
            { propertyName: "fluorescence", title: "Fluorescence", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Fluorescence" },
            { propertyName: "mDiscount", title: "M. Disc", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "MDiscount" },
            { propertyName: "discount", title: "Discount", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Discount" },
            { propertyName: "fAmount", title: "F. Amount", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "FAmount" },
            { propertyName: "createdBy", title: "CreatedBy", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created Date", width: 120, sortOrder: i++, isSelected: true, sortFieldName: "CreatedDate" },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLeadInventoryItems(): GridDetailConfig[] {

        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "Stone Id", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certificate No", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "isLabReturn", title: "IsLabReturn", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "isHold", title: "Hold", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "status", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "holdBy", title: "Hold By", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "isRejected", title: "Rejected", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "isDelivered", title: "Delivered", width: 60, sortOrder: i++, isSelected: false },
            { propertyName: "isMemo", title: "Memo", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "supplier.name", title: "Supplier", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Disc", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "aDiscount", title: "ADisc", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "fDiscount", title: "FDisc", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "perCarat", title: "$/CT", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "netAmount", title: "NetAmt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "vowAmount", title: "Vow Amount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "vowAmount", title: "Volume Amount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fAmount", title: "FAmt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "brokerAmount", title: "Brk Amt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 50, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLeadCartInventoryItems(): GridDetailConfig[] {

        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "Stone Id", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certificate No", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "isHold", title: "Hold", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "isLabReturn", title: "IsLabReturn", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Disc", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "$/CT", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 50, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getCustomerVerificationGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "createdBy", title: "CreatedBy", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "isSupportVerify", title: "Support Verify", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "fullName", title: "FullName", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "birthDate", title: "Birth Date", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "primaryMobile", title: "Mobile No", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "email", title: "Email", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "phoneNo", title: "Telephone No", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "companyName", title: "Company Name", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "designation", title: "Designation", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "businessType", title: "Business Type", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "businessEmail", title: "Business Email", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "businessMobileNo", title: "BusinessMobile No", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "businessPhoneNo", title: "BusinessPhone No", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "address.line1", title: "Address", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "address.country", title: "Country", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "address.zipCode", title: "Postal Code", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "faxNo", title: "Fax", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "referenceName", title: "Reference", width: 130, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getCartItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "customer.companyName", title: "Company Name", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.stoneId", title: "StoneId", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "seller.name", title: "Seller", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.shape", title: "Shape", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.weight", title: "Weight", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.color", title: "Color", width: 20, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.clarity", title: "Clarity", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.cut", title: "Cut", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.polish", title: "Polish", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.symmetry", title: "Symtry", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.fluorescence", title: "Fluor", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.lab", title: "Lab", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.certificateNo", title: "Certificate No.", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.location", title: "Location", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.price.perCarat", title: "Per Carat", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.price.discount", title: "Discount", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.price.netAmount", title: "Price", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "invItem.isDelivered", title: "Deliver", width: 40, sortOrder: i++, isSelected: true },
        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getWatclistItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "customer.companyName", title: "Company Name", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "addedAt", title: "Date", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.stoneId", title: "StoneId", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.certificateNo", title: "Certificate No", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.weight", title: "Weight", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.shape", title: "Shape", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.color", title: "Color", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.clarity", title: "Clarity", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.cut", title: "Cut", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.polish", title: "Polish", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.symmetry", title: "Sym", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.fluorescence", title: "Fluo", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.lab", title: "Lab", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.price.rap", title: "Rap", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "oldDiscount", title: "Old Discount", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.price.discount", title: "Discount", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.price.perCarat", title: "Per Ct", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.price.netAmount", title: "Net Amt", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.location", title: "Location", width: 30, sortOrder: i++, isSelected: true },
        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getSuggestionListGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "company", title: "Company", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "email", title: "Email", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "description", title: "Suggestion", width: 450, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Date", width: 100, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getLeadOrderApprovedListGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "leadNo", title: "LeadNo", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "customer", title: "Customer", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "customer.code", title: "Cust Code", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "broker.name", title: "Broker", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "seller.name", title: "Seller", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "orderDate", title: "Order Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "processDate", title: "Process Date", width: 80, sortOrder: i++, isSelected: true },
            // { propertyName: "pickupLocation", title: "Pickup Location", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "platform", title: "Platfrom", width: 50, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getLeadOrderInventoryItems(): GridDetailConfig[] {

        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "Stone Id", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certificate No", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "isHold", title: "Hold", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "supplier.name", title: "Supplier", width: 90, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 90, sortOrder: i++, isSelected: true },
            { propertyName: "primarySupplier.name", title: "P. Supplier", width: 90, sortOrder: i++, isSelected: true },
            { propertyName: "viaSupplier.name", title: "Via Supplier", width: 90, sortOrder: i++, isSelected: true },
            { propertyName: "ccType", title: "CC Type", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "ccRate", title: "CC Rate", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "aDiscount", title: "ADisc", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "fDiscount", title: "FDisc", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "perCarat", title: "$/CT", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "netAmount", title: "NetAmt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "vowAmount", title: "Vow Amount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "vowAmount", title: "Volume Amount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fAmount", title: "FAmt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "brokerAmount", title: "Brk Amt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "terms", title: "Terms", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "remark", title: "Remark", width: 120, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getAppointmentStoneGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "StoneIds", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getAppointmentGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "createdDate", title: "Created Date", width: 28, sortOrder: i++, isSelected: true },
            { propertyName: "customer.name", title: "Customer Name", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "customer.companyName", title: "Company Name", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "appointmentDate", title: "Appointment Date", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "totalstone", title: "Total stones", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "approvedDate", title: "Approved Date", width: 30, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }


    public getLoginHistoryGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "customer.companyName", title: "Company", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "customer.sellerId", title: 'Seller', width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "privateIPAddress", title: "Private Ip", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "publicIPAddress", title: "Public Ip", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "loginTime", title: "Login Time", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "logoutTime", title: "Logout Time", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "latitude", title: "Latitude", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "longitude", title: "Longitude", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "country", title: "Country", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "state", title: "State", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "city", title: "City", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "browser", title: "Browser", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "browserVersion", title: "Browser Ver.", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "operatingSystem", title: "OS", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "operatingSystemVersion", title: "OS Ver.", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "userAgent", title: "User Agent", width: 40, sortOrder: i++, isSelected: true },

        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getManageEventGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "boothNo", title: "Booth No", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "eventName", title: "Event Name", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "tagline", title: "Tagline", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "venue", title: "Event Venue", width: 100, sortOrder: i++, isSelected: true },
            // { propertyName: "description", title: "Description", width: 200, sortOrder: i++, isSelected: true },
            { propertyName: "startDate", title: "Event Start Date", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "endDate", title: "Event End Date", width: 40, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getVowStatisticGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "customer.companyName", title: "Customer", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "seller.name", title: "Seller", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "lastNetAmount", title: "Last Net Amount", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "maxVOWDiscPer", title: "Max VOW Disc(%)", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "lastTotalPayableAmount", title: "Last Final Amt", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "lastPurchaseDate", title: "Last Purchase Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "lastTotalVOWDiscAmount", title: "Last VOW Disc", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "lastTotalVOWDiscPer", title: "Last VOW Disc(%)", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "lastYearNetAmount", title: "Last Year Net Amount", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "lastBeforeDays", title: "Last P. Before Days", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "nextEligibleVOWDiscount", title: "Next Eligible", width: 40, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getMemoRequestMasterGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "leadNo", title: "Lead No", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "stonecount", title: "Stones", width: 20, sortOrder: i++, isSelected: true },
            { propertyName: "customer.name", title: "Party", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "seller.name", title: "Seller", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "broker.name", title: "Broker", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "supplier.name", title: "Supplier", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "isRequest", title: "Status", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created Date", width: 60, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getMemoRequestMasterDetailGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "Stone Id", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certificate No", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 90, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "aDiscount", title: "A Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fDiscount", title: "F Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 85, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getStoneMediaGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 10, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "Stone Id", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 20, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certi No", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "certiType", title: "Certi Type", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "Certificate", title: "Certificate", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "ImageGroup", title: "ImageGroup", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "Image", title: "Image", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "Video", title: "Video", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "Arrow_Black_BG", title: "Arrow Black", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "Heart_Black_BG", title: "Heart Black", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "aset_white_title", title: "Aset White", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "Ideal_White_BG", title: "Ideal White", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "Office_Light_Black_BG", title: "Office Light Black", width: 40, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getRejectedStoneItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "StoneId", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluor", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "removeStoneReason", title: "Reason", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created Date", width: 55, sortOrder: i++, isSelected: true },

        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getOfferStoneItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "Loat No", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "StoneId" },
            { propertyName: "days", title: "Days", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Days" },
            { propertyName: "aDays", title: "A.Days", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "ADays" },
            { propertyName: "isSold", title: "Sold", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "IsSold" },
            { propertyName: "offerDate", title: "OfferDate", width: 100, sortOrder: i++, isSelected: true, sortFieldName: "OfferDate" },
            { propertyName: "shape", title: "Shape", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Shape" },
            { propertyName: "color", title: "Color", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Color" },
            { propertyName: "weight", title: "Size", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Weight" },
            { propertyName: "clarity", title: "Clarity", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Clarity" },
            { propertyName: "cut", title: "Cut", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Cut" },
            { propertyName: "polish", title: "Polish", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Polish" },
            { propertyName: "symmetry", title: "Symmetry", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Symmetry" },
            // { propertyName: "shade", title: "Shade", width: 40, sortOrder: i++, isSelected: true, sortFieldName: "Shade" },
            { propertyName: "fluorescence", title: "Fluor", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Fluorescence" },
            { propertyName: "certificateNo", title: "Certi No", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "CertificateNo" },
            { propertyName: "comment", title: "Comment", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "Comment" },
            { propertyName: "price.rap", title: "RAP", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Baseprice.Rap" },
            // { propertyName: "comment", title: "NET $(O)", width: 90, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Market Dis", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Price.Discount" },
            { propertyName: "price.perCarat", title: "M.Avg$/CT.", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "M.Net Amount", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "offer", title: "Offer Discount", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "Offer" },
            { propertyName: "offerPerCT", title: "O.Avg$/CT.", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "offerNetAmount", title: "O.Net Amount", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "discDiff", title: "D.Dif", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "discDiff" },
            { propertyName: "customer.name", title: "Party", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "Customer.Name" },
            { propertyName: "seller.name", title: "Posted by", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "Seller.Name" },

        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getrecommended(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "customer.companyName", title: "Company Name", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "createdDate", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "endDate", title: "endDate", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.stoneId", title: "StoneId", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.weight", title: "Weight", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.shape", title: "Shape", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.color", title: "Color", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.clarity", title: "Clarity", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.cut", title: "Cut", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.polish", title: "Polish", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.symmetry", title: "Sym", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.fluorescence", title: "Fluo", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.lab", title: "Lab", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.price.rap", title: "Rap", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.price.discount", title: "Discount", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.price.perCarat", title: "Per Ct", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.price.netAmount", title: "Net Amt", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.location", title: "Location", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryDetail.certificateNo", title: "Certificate No", width: 30, sortOrder: i++, isSelected: false },

        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getPurchaseAnalysisGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "id", title: "Any", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "sym", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fluo", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kPrice.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kPrice.discount", title: "Kapan Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kPrice.perCarat", title: "Kapan $/CT", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kPrice.netAmount", title: "Kapan NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "mPrice.discount", title: "Market Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "mPrice.perCarat", title: "Market $/CT", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "mPrice.netAmount", title: "Market NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "sAVGDays", title: "S.Avg Days", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "mAVGDays", title: "M.Avg Days", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getOrderDetailGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "leadNo", title: "leadNo", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "orderDate", title: "Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "days", title: "Days", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "availableDays", title: "A.Days", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.kapan", title: "Kapan", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.stoneId", title: "Stone Id", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.color", title: "Color", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.diaMeter", title: "Diameter", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "iGrade", title: "IGrade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "mGrade", title: "MGrade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "dollarRate", title: "Dollar rate", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.price.discount", title: "M.Disc", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "vowDiff", title: "VOW Diff ", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.fDiscount", title: "Discount ", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "finalDisc", title: "VOW F.Disc ", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.aDiscount", title: "A.Disc", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.vowDiscount", title: "VOW.Disc", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.vowAmount", title: "VOW Amt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.fAmount", title: "Net Amt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.discount", title: "B.Disc", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.netAmount", title: "B.Net Amt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "customer.companyName", title: "Party", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "broker.name", title: "Broker", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 80, sortOrder: i++, isSelected: false },
            // { propertyName: "location", title: "PickUp Location", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "leadInventoryItems.lab", title: "Lab", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "leadInventoryItems.certificateNo", title: "Certificate No", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "qcCriteria", title: "QC Criteria", width: 80, sortOrder: i++, isSelected: false }];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLeadStoneReleaseGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "leadNo", title: "Lead No", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "customer.name", title: "Party", width: 150, sortOrder: i++, isSelected: false },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "price.discount", title: "Discount", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "seller.name", title: "Seller", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 80, sortOrder: i++, isSelected: true },
            // { propertyName: "identity.name", title: "Requested By", width: 80, sortOrder: i++, isSelected: false },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getSpecialStoneGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "lab", title: "Lab", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "minWeight", title: "Min Weight", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "maxWeight", title: "Max Weight", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.fromTable", title: "From Table", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.toTable", title: "To Table", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.fromDepth", title: "From Depth ", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.toDepth", title: "To Depth ", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "updatedBy", title: "Update At ", width: 60, sortOrder: i++, isSelected: true },
        ]
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getSalesSheetGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "media", title: "Media", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Cert.No", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "Kapan", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "rfid", title: "RFID No", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "grade", title: "Grade", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "shapeRemark", title: "S_Remark", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.discount", title: "B. Disc", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "M. Disc", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "seller", title: "Seller", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "customerName", title: "Customer", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "customerCompany", title: "Company", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "supplier.name", title: "Supplier", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "primarySupplier.name", title: "P. Supplier", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "sDiscount", title: "S. Disc.", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "aDiscount", title: "A. Disc.", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "fDiscount", title: "F. Disc.", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "vowDiscount", title: "Vow Disc.", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "vowAmount", title: "Vow Amt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fAmount", title: "F. Amt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "viaSupplier.name", title: "V. Supplier", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "marketSheetDate", title: "MarketSheetDays", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "availableDays", title: "Avai. Days", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "orderDate", title: "Order Date", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "soldDate", title: "Sold Date", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "Diameter", title: "Diameter", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.brown", title: "Brown", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.green", title: "Green", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.milky", title: "Milky", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.shade", title: "Shade", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.centerBlack", title: "BlackTable", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.sideBlack", title: "BlackCrown", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.culet", title: "Culet", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.table", title: "TA", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.depth", title: "TD", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.iGrade", title: "IGrade", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.mGrade", title: "MGrade", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "pricingComment", title: "P.Comment", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "ccType", title: "CCType", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "ccRate", title: "CCRate", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "broker.name", title: "Broker Name", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "broker.brokrage", title: "Brokerage", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "isDOrder", title: "Order", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "typeA", title: "TypeA", width: 75, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }



    public getLeadDetailGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "leadNo", title: "Lead No", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadStatus", title: "Lead Status", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "platform", title: "Lead Type", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "customer", title: "Party", width: 300, sortOrder: i++, isSelected: true },
            { propertyName: "customer.code", title: "P.Code", width: 50, sortOrder: i++, isSelected: false },
            { propertyName: "customer.email", title: "P.Email", width: 220, sortOrder: i++, isSelected: false },
            { propertyName: "customer.mobile", title: "P.Mobile", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "seller.name", title: "Seller Name", width: 180, sortOrder: i++, isSelected: true },
            { propertyName: "broker.mobileNo", title: "B.Mobile", width: 180, sortOrder: i++, isSelected: true },
            { propertyName: "broker.name", title: "Broker", width: 180, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.expoName", title: "Expo Name", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.stoneId", title: "Stone Id", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.certificateNo", title: "Certificate No", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.weight", title: "Weight", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.status", title: "status", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.isHold", title: "Hold", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.holdBy", title: "Hold By", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.isMemo", title: "Memo", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.supplier.name", title: "Supplier", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.location", title: "Location", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.price.rap", title: "Rap", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.price.discount", title: "Disc", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.aDiscount", title: "ADisc", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.fDiscount", title: "FDisc", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.vowDiscount", title: "Vow/Volume Disc.", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.perCarat", title: "$/CT", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.netAmount", title: "NetAmt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.vowAmount", title: "Vow/Volume Amount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.fAmount", title: "FAmt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.brokerAmount", title: "Brk Amt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.isRejected", title: "Rejected", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.isDelivered", title: "Delivered", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.primarySupplier.name", title: "P. Supplier", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.viaSupplier.name", title: "Via Supplier", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.shape", title: "Shape", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.color", title: "Color", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.clarity", title: "Clarity", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.cut", title: "Cut", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.polish", title: "Polish", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.symmetry", title: "Symmetry", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.fluorescence", title: "Fluorescence", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.ccType", title: "CC Type", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.ccRate", title: "CC Rate", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.terms", title: "Terms", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "leadInventoryItems.remark", title: "Remark", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created Date", width: 180, sortOrder: i++, isSelected: true },
            { propertyName: "orderDate", title: "Order Date", width: 180, sortOrder: i++, isSelected: true },
            { propertyName: "holdDate", title: "Hold Date", width: 180, sortOrder: i++, isSelected: true },
            { propertyName: "processDate", title: "Process Date", width: 180, sortOrder: i++, isSelected: true },

        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getExpoRequestListGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "number", title: "Number", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "stoneCount", title: "Stones", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "issueCount", title: "Issue", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "pendingCount", title: "Pending", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "receivedCount", title: "Received", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "seller.name", title: "Seller", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "updatedBy", title: "Update By", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "updatedAt", title: "Update Date", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getExpoTicketRequestInvListGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "createdBy", title: "Issue By", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "issueAt", title: "Issue Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "updatedBy", title: "Receive By", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "receiveAt", title: "Receive Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Cert.No", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "Kapan", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "rfid", title: "RFID No", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "grade", title: "Grade", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Disc", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getExpoRequestInvListGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "expoRemark", title: "Remark", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "relatedInquiries", title: "Related Inquiries", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "createdBy", title: "Issue By", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "issueAt", title: "Issue Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "updatedBy", title: "Receive By", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "receiveAt", title: "Receive Date", width: 80, sortOrder: i++, isSelected: true },

            { propertyName: "certificateNo", title: "Cert.No", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "Kapan", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "rfid", title: "RFID No", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "grade", title: "Grade", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Disc", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getExpoRequestOrderInvListGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "Stone Id", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certificate No", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "holdBy", title: "Hold By", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "supplier.name", title: "Supplier", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Disc", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "fDiscount", title: "FDisc", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "perCarat", title: "$/CT", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "netAmount", title: "NetAmt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "vowAmount", title: "Vol. Amount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fAmount", title: "FAmt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 70, sortOrder: i++, isSelected: true }
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getQcRequestMasterGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stonecount", title: "Stones", width: 20, sortOrder: i++, isSelected: true },
            { propertyName: "party.name", title: "Party", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "seller.name", title: "Seller", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "isRequest", title: "Status", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created Date", width: 40, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getQcRequestMasterDetailGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "Stone Id", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certificate No", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 90, sortOrder: i++, isSelected: true },
            { propertyName: "remark", title: "Remark", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 85, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLeadRejectedStoneItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "leadNo", title: "LeadNo", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "customer.name", title: "Party", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "broker.name", title: "Broker", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "seller.name", title: "Seller", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "rejectionType", title: "Type", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "totalStones", title: "TotalStones", width: 20, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created Date", width: 55, sortOrder: i++, isSelected: true },

        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLeadRejectedStoneItemsDetailGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "Stone Id", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "offer", title: "Offer", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "comment", title: "Comment", width: 85, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getBidingMasterGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "isKeepUnsold", title: "Sold / Unsold", width: 115, sortOrder: i++, isSelected: true, sortFieldName: "IsKeepUnsold" },
            { propertyName: "stoneId", title: "StoneId", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "StoneId" },
            { propertyName: "lab", title: "Lab", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Lab" },
            { propertyName: "kapan", title: "Kapan", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Kapan" },
            { propertyName: "shape", title: "Shape", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Shape" },
            { propertyName: "weight", title: "Weight", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Weight" },
            { propertyName: "color", title: "Color", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Color" },
            { propertyName: "clarity", title: "Clarity", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Clarity" },
            { propertyName: "cut", title: "Cut", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Cut" },
            { propertyName: "polish", title: "Polish", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Polish" },
            { propertyName: "symmetry", title: "Symmetry", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Symmetry" },
            { propertyName: "fluorescence", title: "Fluorescence", width: 90, sortOrder: i++, isSelected: true, sortFieldName: "Fluorescence" },
            { propertyName: "certificateNo", title: "CertificateNo", width: 90, sortOrder: i++, isSelected: true },
            { propertyName: "certiType", title: "CertiType", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 80, sortOrder: i++, isSelected: true }

        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }
}