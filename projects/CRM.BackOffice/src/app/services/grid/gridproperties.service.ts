import { Injectable } from "@angular/core";
import { GridDetailConfig } from "shared/businessobjects";

@Injectable()

export class GridPropertiesService {

    constructor() { }

    public getOrganizationGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "name", title: "Name", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "origin", title: "Origin", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "organizationType", title: "OrganizationType", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "businessType", title: "BusinessType", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "registrationNo", title: "RegistrationNo", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "incomeTaxNo", title: "IncomeTaxno", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "taxNo", title: "TaxNo", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "gstNo", title: "GstNo", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "membership", title: "Membership", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "address.line1", title: "Address", width: 250, sortOrder: i++, isSelected: true },
            { propertyName: "website", title: "Website", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "creditLimit.days", title: "CreditLimit", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "person", title: "Person", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "email", title: "Email", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "mobileNo", title: "MobileNo", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "phoneNo", title: "PhoneNo", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "faxNo", title: "FaxNo", width: 100, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getEmployeeGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "fullName", title: "Name", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "organization.name", title: "Organization", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "branch.name", title: "Branch", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "department", title: "Department", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "origin", title: "Origin", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "email", title: "Email", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "mobile", title: "Mobile No", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "address.line1", title: "Address", width: 250, sortOrder: i++, isSelected: true },
            { propertyName: "joiningDate", title: "Join Date", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "enrollmentNumber", title: "E Number", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "isManager", title: "Manager", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "isActive", title: "Active", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "isAvailable", title: "Available", width: 100, sortOrder: i++, isSelected: true }
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getUserGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "email", title: "Email", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "phoneNumber", title: "Mobile No", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "origin", title: "Origin", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "emailConfirmed", title: "EmailConfirm", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "phoneNumberConfirmed", title: "PhoneNoConfirm", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "twoFactorEnabled", title: "TwoFactorEnabled", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "lockoutEnabled", title: "LockoutEnabled", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "lockoutEnd", title: "LockoutEnd", width: 60, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

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

    public getInventoryUploadGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "article", title: "Article", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "perCarat", title: "PerCarat", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "lab", title: "Lab", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "shapeRemark", title: "S_Remark", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "CertificateNo", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inscription", title: "Inscription", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "depth", title: "Depth", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "table", title: "Table", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "length", title: "Length", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "width", title: "Width", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "height", title: "Height", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "crownHeight", title: "CrownHeight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "crownAngle", title: "CrownAngle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "pavilionDepth", title: "PavilionDepth", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "pavilionAngle", title: "PavilionAngle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "girdlePer", title: "GirdlePer", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "girdle", title: "Girdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "ratio", title: "Ratio", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "brown", title: "Brown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "green", title: "Green", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "milky", title: "Milky", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shade", title: "Shade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "sideBlack", title: "SideBlack", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "centerSideBlack", title: "CenterSideBlack", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "centerBlack", title: "CenterBlack", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "sideWhite", title: "SideWhite", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "centerSideWhite", title: "CenterSideWhite", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "openCrown", title: "OpenCrown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "openTable", title: "OpenTable", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "openPavilion", title: "OpenPavilion", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "openGirdle", title: "OpenGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "girdleCondition", title: "GirdleCondition", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "efoc", title: "EFOC", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "efop", title: "EFOP", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "culet", title: "Culet", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "hna", title: "HNA", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "eyeClean", title: "EyeClean", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "ktoS", title: "KtoS", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "naturalOnTable", title: "NaturalOnTable", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "naturalOnGirdle", title: "NaturalOnGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "naturalOnCrown", title: "NaturalOnCrown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "naturalOnPavillion", title: "NaturalOnPavillion", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "flColor", title: "FLColor", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "luster", title: "Luster", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "bowtie", title: "Bowtie", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "comments", title: "Lab Comments", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapanOrigin", title: "Kapan Origin", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "bgmComments", title: "BGM Comments", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLabMasterGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "name", title: "Lab Name", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "website", title: "Website", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "email", title: "Email", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "accountNo", title: "Account No", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "address.line1", title: "Address", width: 250, sortOrder: i++, isSelected: true },
            { propertyName: "mobileNo", title: "Mobile No", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "faxNo", title: "Fax No", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "phoneNo", title: "Phone No", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "registrationNo", title: "RegistrationNo", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "incomeTaxNo", title: "IncomeTaxNo", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "taxNo", title: "TaxNo", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "excFormat", title: "ExcFormat", width: 150, sortOrder: i++, isSelected: false },
            { propertyName: "labConfig.labAPI", title: "Lab URL", width: 150, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getLogisticMasterGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "name", title: "Logistic Name", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "email", title: "Email", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "mobileNo", title: "Mobile No", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "phoneNo", title: "Phone No", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "faxNo", title: "Fax No", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "website", title: "Website", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "registrationNo", title: "RegistrationNo", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "incomeTaxNo", title: "IncomeTaxNo", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "taxNo", title: "TaxNo", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "address.line1", title: "Address", width: 250, sortOrder: i++, isSelected: true },
            { propertyName: "logisticConfig.excFormat", title: "Excel Format", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "logisticConfig.printFormat", title: "Print Format", width: 150, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getCompanyMasterGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "name", title: "Company Name", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "email", title: "Email", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "mobileNo", title: "Mobile No", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "phoneNo", title: "Phone No", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "faxNo", title: "Fax No", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "website", title: "Website", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "registrationNo", title: "RegistrationNo", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "incomeTaxNo", title: "IncomeTaxNo", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "taxNo", title: "TaxNo", width: 150, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getChequeGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "transactionNumber", title: "Tran No", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "chequeNo", title: "Cheque No", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "fromLedger.name", title: "From", width: 180, sortOrder: i++, isSelected: true },
            { propertyName: "toLedger.name", title: "To", width: 180, sortOrder: i++, isSelected: true },
            { propertyName: "netTotal", title: "Amount", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "chequeDate", title: "Cheque Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "isReturn", title: "Return", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "returnDate", title: "Return Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "isCleared", title: "Cleared", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "clearedDate", title: "Cleared Date", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getInventoryGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "media", title: "Media", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "Kapan", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "kapanOrigin", title: "Kapan Origin", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "rfid", title: "RFID No", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "grade", title: "Grade", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "shapeRemark", title: "S_Remark", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluor", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.rap", title: "Rap", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.discount", title: "Disc", width: 55, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.netAmount", title: "NetAmt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.perCarat", title: "$/CT", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "isHold", title: "Hold", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "holdBy", title: "HoldBy", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "isRapnetHold", title: "RapHold", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "isCPBlocked", title: "CPBlocked", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "isLabReturn", title: "LabRtn", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "isPricingRequest", title: "PReq", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "isMemo", title: "Memo", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inWardMemo", title: "InWard Memo", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "heldBy", title: "Held By", width: 180, sortOrder: i++, isSelected: true },
            { propertyName: "memoProcess", title: "Memo Proc.", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "lab", title: "Lab", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certi No", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "certiType", title: "Certi. Type", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inscription", title: "Inscription", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "comments", title: "Lab Comments", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "bgmComments", title: "BGM Comments", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Arrival", width: 95, sortOrder: i++, isSelected: true },
            { propertyName: "labSendDate", title: "LabSend", width: 95, sortOrder: i++, isSelected: true },
            { propertyName: "labResultDate", title: "LabResult", width: 95, sortOrder: i++, isSelected: true },
            { propertyName: "labReceiveDate", title: "LabRec", width: 95, sortOrder: i++, isSelected: true },
            { propertyName: "marketSheetDate", title: "MktSheetDays", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "stoneOrg.deptName", title: "Dept", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "identity.name", title: "Emp", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.shade", title: "Shade", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "typeA", title: "TypeA", width: 65, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getInclusionUploadGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "brown", title: "Brown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "green", title: "Green", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "milky", title: "Milky", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shade", title: "Shade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "sideBlack", title: "S_Black", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "centerBlack", title: "C_Black", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "openCrown", title: "O_Crown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "openTable", title: "O_Table", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "openPavilion", title: "O_Pavillion", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "openGirdle", title: "O_Girdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "girdleCondition", title: "Girdle Cond.", width: 90, sortOrder: i++, isSelected: true },
            { propertyName: "efoc", title: "EFOC", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "efop", title: "EFOP", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "culet", title: "Culet", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "hna", title: "HNA", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "eyeClean", title: "Eye Clean", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "naturalOnGirdle", title: "NOG", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "naturalOnCrown", title: "NOC", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "naturalOnPavillion", title: "NOP", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "bowtie", title: "Bowtie", width: 80, sortOrder: i++, isSelected: true }
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLedgerGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "name", title: "Ledger Name", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "group.name", title: "Ledger Group", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "broker.brokrage", title: "Brokerage %", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "code", title: "Code", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "contactPerson", title: "Con_Person", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "address.line1", title: "Address", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "address.country", title: "Country", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "email", title: "Email", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "mobileNo", title: "Mobile No", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "phoneNo", title: "Phone No", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "isVerified", title: "Verified", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "faxNo", title: "FaxNo", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "incomeTaxNo", title: "Inc_Tax No", width: 110, sortOrder: i++, isSelected: true },
            { propertyName: "taxNo", title: "TaxNo", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "lineOfBusiness", title: "Line Of Business", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "expiredDate", title: "Expire Date", width: 110, sortOrder: i++, isSelected: true },
            { propertyName: "isActive", title: "Active", width: 70, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getBrokerGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "name", title: "Name", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "code", title: "Code", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "brokrage", title: "Brokrage %", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "through", title: "Through %", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "email", title: "Email", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "mobileNo", title: "Mobile No", width: 130, sortOrder: i++, isSelected: true },
            { propertyName: "address", title: "Address", width: 130, sortOrder: i++, isSelected: true },
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

    public getCustomerVerificationGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
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

    public getPriceRequestGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "analytic", title: "Analytic", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
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
            { propertyName: "ratio", title: "Ratio", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "Girdle", title: "Girdle", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.ktoS", title: "KtoS", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.brown", title: "Brown", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.green", title: "Green", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.milky", title: "Milky", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.shade", title: "Shade", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Pricing Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "expiryDate", title: "Expiry Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "comments", title: "Comments", width: 80, sortOrder: i++, isSelected: true }]

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getInventoryPriceGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "analytic", title: "Analytic", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
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
            { propertyName: "status", title: "Status", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.discount", title: "Base Disc", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Main Disc", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "tempDisc", title: "T. Main Disc", width: 100, sortOrder: i++, isSelected: true, editor: 'numeric' },
            { propertyName: "discDiff", title: "Disc Diff", width: 100, sortOrder: i++, isSelected: true, editor: 'numeric' },
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
            { propertyName: "ratio", title: "Ratio", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "Girdle", title: "Girdle", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.ktoS", title: "KtoS", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.brown", title: "Brown", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.green", title: "Green", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.milky", title: "Milky", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.shade", title: "Shade", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Pricing Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "comments", title: "Comments", width: 80, sortOrder: i++, isSelected: true }]

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
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
            { propertyName: "basePrice.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
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
            { propertyName: "createdDate", title: "Pricing Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "comments", title: "Comments", width: 80, sortOrder: i++, isSelected: true }]

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

    public getPlanMakerGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.perCarat", title: "PerCarat", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "Kapan", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "article", title: "Article", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.table", title: "Table", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.length", title: "Length", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.width", title: "Width", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.height", title: "Height/Depth", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.depth", title: "Depth% / Total Depth", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.crownHeight", title: "CrownHeight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.crownAngle", title: "CrownAngle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.pavilionDepth", title: "PavilionDepth", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.pavilionAngle", title: "PavilionAngle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.girdlePer", title: "GirdlePer", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.minGirdle", title: "MinGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.maxGirdle", title: "MaxGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.ratio", title: "Ratio", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.brown", title: "Brown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.green", title: "Green", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.milky", title: "Milky", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.shade", title: "Shade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.sideBlack", title: "SideBlack", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.centerSideBlack", title: "CenterSideBlack", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.centerBlack", title: "CenterBlack", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.sideWhite", title: "SideWhite", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.centerSideWhite", title: "CenterSideWhite", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.openCrown", title: "OpenCrown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.openTable", title: "OpenTable", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.openPavilion", title: "OpenPavilion", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.openGirdle", title: "OpenGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.girdleCondition", title: "GirdleCondition", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.efoc", title: "EFOC", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.efop", title: "EFOP", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.culet", title: "Culet", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.hna", title: "HNA", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.eyeClean", title: "EyeClean", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.ktoS", title: "KtoS", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.naturalOnTable", title: "NaturalOnTable", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.naturalOnGirdle", title: "NaturalOnGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.naturalOnCrown", title: "NaturalOnCrown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.naturalOnPavillion", title: "NaturalOnPavillion", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.flColor", title: "FLColor", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.luster", title: "Luster", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.bowtie", title: "Bowtie", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "comments", title: "Comments", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getGradingGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "rapVer", title: "RapVer", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "identity.name", title: "Added By", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Added Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "CertificateNo", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.mGrade", title: "MGrade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.iGrade", title: "IGrade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.perCarat", title: "PerCarat", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "Kapan", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "article", title: "Article", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.table", title: "Table", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.length", title: "Length", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.width", title: "Width", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.height", title: "Height/Depth", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.depth", title: "Depth% / Total Depth", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.crownHeight", title: "CrownHeight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.crownAngle", title: "CrownAngle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.pavilionDepth", title: "PavilionDepth", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.pavilionAngle", title: "PavilionAngle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.girdlePer", title: "GirdlePer", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.minGirdle", title: "MinGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.maxGirdle", title: "MaxGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.ratio", title: "Ratio", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.brown", title: "Brown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.green", title: "Green", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.milky", title: "Milky", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.shade", title: "Shade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.sideBlack", title: "SideBlack", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.centerSideBlack", title: "CenterSideBlack", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.centerBlack", title: "CenterBlack", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.sideWhite", title: "SideWhite", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.centerSideWhite", title: "CenterSideWhite", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.openCrown", title: "OpenCrown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.openTable", title: "OpenTable", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.openPavilion", title: "OpenPavilion", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.openGirdle", title: "OpenGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.girdleCondition", title: "GirdleCondition", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.efoc", title: "EFOC", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.efop", title: "EFOP", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.culet", title: "Culet", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.hna", title: "HNA", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.eyeClean", title: "EyeClean", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.ktoS", title: "KtoS", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.naturalOnTable", title: "NaturalOnTable", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.naturalOnGirdle", title: "NaturalOnGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.naturalOnCrown", title: "NaturalOnCrown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.naturalOnPavillion", title: "NaturalOnPavillion", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.flColor", title: "FLColor", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.luster", title: "Luster", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inclusion.bowtie", title: "Bowtie", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "comments", title: "Lab Comments", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "bgmComments", title: "BGM Comments", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLabIssueGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "Action", title: "Action", width: 50, sortOrder: i++, isSelected: true },
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
            { propertyName: "measurement.length", title: "Length", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.width", title: "Width", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "measurement.height", title: "Height/Depth", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.perCarat", title: "PerCarat", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLabReceiveGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "Action", title: "Action", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "Kapan", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "isLabResultFound", title: "LabResult", width: 80, sortOrder: i++, isSelected: true }
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getConsignmentInvoiceGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "Action", title: "Action", width: 60, sortOrder: i++, isSelected: true },
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
            { propertyName: "basePrice.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.perCarat", title: "PerCarat", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLabResultGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "media", title: "Media", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "type", title: "Type", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "labServiceAction", title: "Action", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "Kapan", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "CertificateNo", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "article", title: "Article", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "perCarat", title: "PerCarat", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "depth", title: "Depth", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "table", title: "Table", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "length", title: "Length", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "width", title: "Width", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "crownHeight", title: "CrownHeight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "crownAngle", title: "CrownAngle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "pavilionDepth", title: "PavilionDepth", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "pavilionAngle", title: "PavilionAngle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "girdlePer", title: "GirdlePer", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "minGirdle", title: "MinGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "maxGirdle", title: "MaxGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "ratio", title: "Ratio", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "brown", title: "Brown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "green", title: "Green", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "milky", title: "Milky", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shade", title: "Shade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "sideBlack", title: "SideBlack", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "centerSideBlack", title: "CenterSideBlack", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "centerBlack", title: "CenterBlack", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "sideWhite", title: "SideWhite", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "centerSideWhite", title: "CenterSideWhite", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "openCrown", title: "OpenCrown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "openTable", title: "OpenTable", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "openPavilion", title: "OpenPavilion", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "openGirdle", title: "OpenGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "girdleCondition", title: "GirdleCondition", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "efoc", title: "EFOC", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "efop", title: "EFOP", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "culet", title: "Culet", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "hna", title: "HNA", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "eyeClean", title: "EyeClean", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "ktoS", title: "ktoS", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "naturalOnTable", title: "NaturalOnTable", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "naturalOnGirdle", title: "NaturalOnGirdle", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "naturalOnCrown", title: "NaturalOnCrown", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "naturalOnPavillion", title: "NaturalOnPavillion", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "flColor", title: "FLColor", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "luster", title: "Luster", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "bowtie", title: "Bowtie", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "comments", title: "Lab Comments", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "bgmComments", title: "BGM Comments", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "controlNo", title: "Control No/RFID", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getRFIDGrid(): GridDetailConfig[] {

        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certi No", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "Kapan", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "rfid", title: "RFID", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLabIssueMasterGrid(): GridDetailConfig[] {

        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stonecount", title: "Stones", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "receivecount", title: "Received", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "pendingcount", title: "Pending", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Issue Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "lab.name", title: "Lab", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "logistic.name", title: "Logistic", width: 400, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLabIssueItems(): GridDetailConfig[] {

        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "status", title: "Status", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "service", title: "Service", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "receiveDate", title: "Receive Date", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "Stone Id", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "recheckReason", title: "Recheck Reason", width: 180, sortOrder: i++, isSelected: true },
            { propertyName: "isRepairing", title: "Repairing", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "isLabResultFound", title: "LabResult", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "oldCertificateNo", title: "OldCertificateNo", width: 30, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLeadInventoryItems(): GridDetailConfig[] {

        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "isLead", title: "Ng Status", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "stoneStatus", title: "Status", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "stoneId", title: "Stone Id", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "reqPrice.discount", title: "Req Discount", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "reqPrice.netAmount", title: "Req NetAmount", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "reqPrice.perCarat", title: "Req $/CT", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "reqDis", title: "ReqDis", width: 85, sortOrder: i++, isSelected: false },
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

    public getLeadInventoryItemsApproved(): GridDetailConfig[] {

        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "Stone Id", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "orderPrice.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "orderPrice.discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "orderPrice.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "orderPrice.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true },
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

    public getOrderItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "transactionNo", title: "Transaction No", width: 50, sortOrder: i++, isSelected: true, sortFieldName: "TransactionNo" },
            { propertyName: "leadNumber", title: "Lead No", width: 100, sortOrder: i++, isSelected: true, sortFieldName: "LeadNumber" },
            { propertyName: "party.name", title: "Party Company", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "Party.Name" },
            { propertyName: "party.address.country", title: "Party Country", width: 120, sortOrder: i++, isSelected: true, sortFieldName: "Party.Address.Country" },
            { propertyName: "party.code", title: "Party Code", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "Party.Code" },
            { propertyName: "party.contactPerson", title: "Party Contact Person", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "Party.ContactPerson" },
            { propertyName: "seller.name", title: "Seller", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "Seller.Name" },
            { propertyName: "broker.name", title: "Broker", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "Broker.Name" },
            { propertyName: "invItem.stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.StoneId" },
            { propertyName: "invItem.certificateNo", title: "Certificate No", width: 120, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.CertificateNo" },
            { propertyName: "invItem.certiType", title: "Certi.Type", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.CertiType" },
            { propertyName: "invItem.isMemo", title: "Memo", width: 60, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.IsMemo" },
            { propertyName: "invItem.heldBy", title: "M Company Name", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.HeldBy" },
            { propertyName: "invItem.fAmount", title: "Order Amt($)", width: 120, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.FAmount" },
            { propertyName: "invItem.vowAmount", title: "Vow Amt($)", width: 120, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.VowAmount" },
            { propertyName: "invItem.brokerAmount", title: "Broker Amt($)", width: 120, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.BrokerAmount" },
            { propertyName: "invItem.ccType", title: "CC Type", width: 120, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.CcType" },
            { propertyName: "invItem.ccRate", title: "CC Rate", width: 120, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.CcRate" },
            { propertyName: "createdDate", title: "Order Date", width: 100, sortOrder: i++, isSelected: true, sortFieldName: "CreatedDate" },
            { propertyName: "transactionDate", title: "Transaction Date", width: 100, sortOrder: i++, isSelected: true, sortFieldName: "TransactionDate" },
            { propertyName: "invItem.shape", title: "Shape", width: 60, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.Shape" },
            { propertyName: "invItem.weight", title: "Weight", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.Weight" },
            { propertyName: "invItem.color", title: "Color", width: 60, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.Color" },
            { propertyName: "invItem.clarity", title: "Clarity", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.Clarity" },
            { propertyName: "invItem.cut", title: "Cut", width: 50, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.Cut" },
            { propertyName: "invItem.polish", title: "Polish", width: 60, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.Polish" },
            { propertyName: "invItem.symmetry", title: "Symmetry", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.Symmetry" },
            { propertyName: "invItem.fluorescence", title: "Fluor", width: 70, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.Fluorescence" },
            { propertyName: "isDelivered", title: "Delivered", width: 50, sortOrder: i++, isSelected: true, sortFieldName: "IsDelivered" },
            { propertyName: "deliveredDate", title: "Delivered Date", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "DeliveredDate" },
            { propertyName: "takenBy", title: "Taken By", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "TakenBy" },
            { propertyName: "docketNo", title: "Docket No", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "DocketNo" },
            { propertyName: "logisticName", title: "Logistic Name", width: 150, sortOrder: i++, isSelected: true, sortFieldName: "LogisticName" },
            { propertyName: "invItem.terms", title: "Terms", width: 120, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.Terms" },
            { propertyName: "invItem.remark", title: "Remark", width: 120, sortOrder: i++, isSelected: true, sortFieldName: "InvItem.Remark" },
        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getOrderItemsDet(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 20, sortOrder: i++, isSelected: true },
            { propertyName: "orderInventoryItem.stoneId", title: "StoneId", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "orderInventoryItem.shape", title: "Shape", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "orderInventoryItem.weight", title: "Weight", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "orderInventoryItem.color", title: "Color", width: 20, sortOrder: i++, isSelected: true },
            { propertyName: "orderInventoryItem.clarity", title: "Clarity", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "orderInventoryItem.cut", title: "Cut", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "orderInventoryItem.polish", title: "Polish", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "orderInventoryItem.symmetry", title: "Symmetry", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "orderInventoryItem.fluorescence", title: "Fluorescence", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "orderPrice.rap", title: "Rap", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "orderPrice.discount", title: "Discount", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "orderPrice.netAmount", title: "NetAmount", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "orderPrice.perCarat", title: "PerCarat", width: 40, sortOrder: i++, isSelected: true },
        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getInvoiceItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "leadNo", title: "Lead No", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "orderNo", title: "Order No", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryItem.stoneId", title: "StoneId", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryItem.shape", title: "Shape", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryItem.weight", title: "Weight", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryItem.color", title: "Color", width: 20, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryItem.clarity", title: "Clarity", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryItem.cut", title: "Cut", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryItem.polish", title: "Polish", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryItem.symmetry", title: "Symmetry", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "inventoryItem.fluorescence", title: "Fluorescence", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "invoicePrice.rap", title: "Rap", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "invoicePrice.discount", title: "Discount", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "sDiscount", title: "S Disc", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "ngDiscount", title: "NG Disc", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "invoicePrice.perCarat", title: "PerCarat", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "invoicePrice.netAmount", title: "NetAmount", width: 45, sortOrder: i++, isSelected: true },
        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getInvoiceAll(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "invoiceNo", title: "Invoice No", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "party.name", title: "Party", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "invoiceType", title: "Invoice Type", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Invoice Date", width: 28, sortOrder: i++, isSelected: true },
            { propertyName: "dueDate", title: "Due Date", width: 28, sortOrder: i++, isSelected: true },
            { propertyName: "broker.name", title: "Broker", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "invoicePrice.netAmount", title: "Amount", width: 30, sortOrder: i++, isSelected: true },
        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getMemoIssueGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "Action", title: "Action", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: false },
            { propertyName: "status", title: "Status", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "isHold", title: "Hold", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "holdBy", title: "Hold By", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "isMemo", title: "Memo", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certificate No", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true },
            //{ propertyName: "measurement.length", title: "Length", width: 80, sortOrder: i++, isSelected: true },
            //{ propertyName: "measurement.width", title: "Width", width: 80, sortOrder: i++, isSelected: true },
            //{ propertyName: "measurement.height", title: "Height/Depth", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.rap", title: "B.Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.perCarat", title: "B.PerCt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.discount", title: "B.Disc", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.netAmount", title: "B.NetAmt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "P.Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "P.PerCt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "P.Disc", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "P.NetAmt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "Kapan", width: 60, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getMemoMasterGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "memoNo", title: "MemoNo", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "party.name", title: "Party", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "party.mobileNo", title: "Party MobileNo", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "broker.name", title: "Broker", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "seller", title: "Seller", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "qcReason", title: "Qc Reason", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "Issue", title: "Issue", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "Received", title: "Received", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "Pending", title: "Pending", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "isFullReceive", title: "Completed", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "isOverseas", title: "Overseas", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "expiredDays", title: "Expire Days", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "IssueDate", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "expiredDate", title: "Expired Date", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "createdBy", title: "Create By", width: 70, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLabServiceGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "labName", title: "Lab Name", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "service", title: "Service", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "serviceCode", title: "Service Code", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "action", title: "Action", width: 50, sortOrder: i++, isSelected: true }
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getLabexpenseItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "lab.name", title: "Lab", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certi_No", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "invoiceNo", title: "InvoiceNo", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "invoiceDate", title: "InvoiceDate", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "jobNo", title: "JobNo", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "controlNo", title: "ControlNo", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "service", title: "Service", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "labFees", title: "LabFees", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "handlingCharge", title: "HandlingAmt", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "shippingCharge", title: "ShippingAmt", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "taxAmount", title: "TaxAmt", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "fromCurrency", title: "From Curr", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "fromRate", title: "From C.Rate", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "toCurrency", title: "To Curr", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "toRate", title: "To C.Rate", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "totalExpense", title: "TotalExpense", width: 50, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getSalesPLItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certificate No", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "lab", title: "Lab", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "origin", title: "Origin", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Discount", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "$/Ct", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "Net Amount", width: 50, sortOrder: i++, isSelected: true },
            // { propertyName: "dollarRate", title: "Dollar Rate", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "ccType", title: "CC Type", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "ccRate", title: "CC Rate", width: 50, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getLabinvoiceItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "lab.name", title: "Lab", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "CertificateNo", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "invoiceNo", title: "InvoiceNo", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "invoiceDate", title: "InvoiceDate", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "jobNo", title: "JobNo", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "controlNo", title: "ControlNo", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "service", title: "Service", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "labFees", title: "LabFees", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "handlingCharge", title: "HandlingCharge", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "shippingCharge", title: "ShippingCharge", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "taxAmount", title: "TaxAmount", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "fromCurrency", title: "From Curr", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "fromRate", title: "From C.Rate", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "toCurrency", title: "To Curr", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "toRate", title: "To C.Rate", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "totalExpense", title: "TotalExpense", width: 50, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getLabExpenseDetItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "lab.name", title: "Lab", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 45, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "CertificateNo", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "invoiceNo", title: "InvoiceNo", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "invoiceDate", title: "InvoiceDate", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "jobNo", title: "JobNo", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "controlNo", title: "ControlNo", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "service", title: "Service", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "labFees", title: "LabFees", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "handlingCharge", title: "HandlingCharge", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "shippingCharge", title: "ShippingCharge", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "taxAmount", title: "TaxAmount", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "fromCurrency", title: "FromCur", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "fromRate", title: "FromRate", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "toCurrency", title: "ToCur", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "toRate", title: "ToRate", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "totalExpense", title: "TotalExpense", width: 50, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getStoneManualIssueGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stoneId", title: "StoneId", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "kapan", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.rap", title: "Rap", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.discount", title: "Disc", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.netAmount", title: "Net Amt", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "basePrice.perCarat", title: "Per Crt", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "identity.name", title: "Employee", width: 65, sortOrder: i++, isSelected: true },
            { propertyName: "status", title: "Status", width: 60, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues

    }


    public getInvoiceServiceGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "name", title: "Name", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "category", title: "Category", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "rate", title: "Rate", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "tax", title: "Tax %", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "unit", title: "Unit", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "isActive", title: "Active", width: 70, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getNotificationGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "title", title: "Title", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "categoryType", title: "Category Type", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "description", title: "Description", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "senderId", title: "Sender", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "receiverId", title: "Receiver", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created Date", width: 80, sortOrder: i++, isSelected: true },

        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues

    }

    public getProposalGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "media", title: "Media", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "StoneId", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "kapan", title: "Kapan", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "rfid", title: "RFID No", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "grade", title: "Grade", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "shape", title: "Shape", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "color", title: "Color", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "clarity", title: "Clarity", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "cut", title: "Cut", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "polish", title: "Polish", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "symmetry", title: "Symmetry", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "fluorescence", title: "Fluorescence", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.rap", title: "Rap", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.discount", title: "Discount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.netAmount", title: "NetAmount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "price.perCarat", title: "$/CT", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "lab", title: "Lab", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certificate No", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "inscription", title: "Inscription", width: 80, sortOrder: i++, isSelected: true }
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }


    public getTransactItemGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "name", title: "Name", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "unit", title: "Unit", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "group.name", title: "Transact Group", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "tax.name", title: "Tax", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "taxCode", title: "Tax Code", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "description", title: "Description", width: 120, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getInWardItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "memoNo", title: "MemoNo", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "party.name", title: "Party", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "broker.name", title: "Broker", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "courierName.name", title: "CourierName", width: 100, sortOrder: i++, isSelected: true },
            // { propertyName: "taxCode", title: "Employee", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "expiryDate", title: "Expiry Date", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "expiryDays", title: "Expiry Days", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created Date", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "isReturned", title: "IsReturned", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "returnDate", title: "Return Date", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "totalPcs", title: "Total Pcs", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "totalWeight", title: "Weight", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "totalAmount", title: "Amount", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "returnPcs", title: "Return Pcs", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "purchasePcs", title: "Purchase Pcs", width: 40, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getMemoReturnItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "memoReturnNo", title: "Memo Return No", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "party.name", title: "Party", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "totalPcs", title: "Total Pcs", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "totalWeight", title: "Weight", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "totalAmount", title: "Amount", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "createdBy", title: "Created By", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created Date", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getTransactionItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "number", title: "Trans. No", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "refNumber", title: "Invoice No", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "fromLedger.name", title: "From Ledger", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "toLedger.name", title: "To Ledger", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "transactionType", title: "Transaction Type", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "transactionDate", title: "Trans. Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "weight", title: "Weight", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "amount", title: "Amount", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "discount", title: "Discount", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "taxAmount", title: "Tax Amount", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "tdsAmount", title: "TDS Amount", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "tcsAmount", title: "TCS Amount", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "addAmount", title: "Add Amount", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "netTotal", title: "Net Total", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "paidAmount", title: "Paid Amount", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "paidDate", title: "Paid Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "transactionDetail.toCurrency", title: "CC Type", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "ccAmount", title: "CC Amount", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "transactionDetail.dueDate", title: "Due Date", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues;
    }

    public getMemoRequestMasterGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stonecount", title: "Stones", width: 20, sortOrder: i++, isSelected: true },
            { propertyName: "party.name", title: "Party", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "seller.name", title: "Seller", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "broker.name", title: "Broker", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "isRequest", title: "Status", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created Date", width: 40, sortOrder: i++, isSelected: true },
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


    public getQcRequestMasterGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "stonecount", title: "Stones", width: 20, sortOrder: i++, isSelected: true },
            { propertyName: "leadNo", title: "Lead No", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "party.name", title: "Party", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "seller.name", title: "Seller", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "isRequest", title: "Status", width: 50, sortOrder: i++, isSelected: true },
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
            { propertyName: "status", title: "Status", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 90, sortOrder: i++, isSelected: true },
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

    public getRepairingGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "isIssue", title: "Repair Status", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "memoStatus", title: "Memo Status", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "defectedStone.stoneId", title: "Stone Id", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "defectedStone.weight", title: "Weight", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "defectedStone.shape", title: "Shape", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "defectedStone.color", title: "Color", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "defectedStone.clarity", title: "Clarity", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "defectedStone.cut", title: "Cut", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "defectedStone.polish", title: "Polish", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "defectedStone.symmetry", title: "Symmetry", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "defectedStone.fluorescence", title: "Fluorescence", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "description", title: "Description", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "createdBy", title: "Created By", width: 120, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Created Date", width: 100, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLedgerSummaryGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "ledger.name", title: "Ledger Name", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "ledger.group", title: "Ledger Group", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "ledger.mobileNo", title: "Mobile", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "credit", title: "Credit", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "debit", title: "Debit", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "total", title: "Total", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "lastTransaction", title: "Last Trans. Date", width: 80, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getLedgerOutStandingSummaryGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "ledger.name", title: "Name", width: 150, sortOrder: i++, isSelected: true },
            { propertyName: "ledger.group", title: "Group", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "credit", title: "Credit", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "debit", title: "Debit", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "total", title: "Total", width: 50, sortOrder: i++, isSelected: true },
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getWeeklySummaryGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "kapan", title: "Kapan", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "previousSummary.pcsCount", title: "Prev Pcs", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "previousSummary.weight", title: "Prev Wt", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "previousSummary.amt", title: "Prev Amt", width: 60, sortOrder: i++, isSelected: false },
            { propertyName: "arrival.pcsCount", title: "New Pcs", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "arrival.weight", title: "New Wt", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "arrival.amt", title: "New Amt", width: 70, sortOrder: i++, isSelected: false },
            { propertyName: "total.pcsCount", title: "Total Pcs", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "total.weight", title: "Total Wt", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "total.amt", title: "Total Amt", width: 70, sortOrder: i++, isSelected: false },
            { propertyName: "inwardMemo.pcsCount", title: "Inward Pcs", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inwardMemo.weight", title: "Inward Wt", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inwardMemo.amt", title: "Inward Amt", width: 70, sortOrder: i++, isSelected: false },
            { propertyName: "lab.pcsCount", title: "Lab Pcs", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "lab.weight", title: "Lab Wt", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "lab.amt", title: "Lab Amt", width: 70, sortOrder: i++, isSelected: false },
            { propertyName: "labDiff.weight", title: "Lab Diff Wt", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "inTransit.pcsCount", title: "Transit Pcs", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "inTransit.weight", title: "Transit Wt", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "inTransit.amt", title: "Transit Amt", width: 90, sortOrder: i++, isSelected: false },
            { propertyName: "memo.pcsCount", title: "Memo Pcs", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "memo.weight", title: "Memo Wt", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "memo.amt", title: "Memo Amt", width: 70, sortOrder: i++, isSelected: false },
            { propertyName: "stock.pcsCount", title: "Stock Pcs", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "stock.weight", title: "Stock Wt", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "stock.amt", title: "Stock Amt", width: 70, sortOrder: i++, isSelected: false },
            // { propertyName: "onHand.pcsCount", title: "On Hand Pcs", width: 70, sortOrder: i++, isSelected: true },
            // { propertyName: "onHand.weight", title: "On Hand Wt", width: 70, sortOrder: i++, isSelected: true },
            // { propertyName: "onHand.amt", title: "On Hand Amt", width: 90, sortOrder: i++, isSelected: false },
            { propertyName: "order.pcsCount", title: "Order Pcs", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "order.weight", title: "Order Wt", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "order.amt", title: "Order Amt", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "delivered.pcsCount", title: "Deli. Pcs", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "delivered.weight", title: "Deli. Wt", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "delivered.amt", title: "Deli. Amt", width: 80, sortOrder: i++, isSelected: false },
            { propertyName: "balance.pcsCount", title: "Balance Pcs", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "balance.weight", title: "Balance Wt", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "balance.amt", title: "Balance Amt", width: 80, sortOrder: i++, isSelected: false }
        ];

        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getExportRequestGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "checkbox", title: "Checkbox", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "stoneId", title: "Stone Id", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "certificateNo", title: "Certificate No", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "requestedBy", title: "Req. By", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "location", title: "Location", width: 90, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Req. Date", width: 100, sortOrder: i++, isSelected: true },
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

    public getBrokerageGrid(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "brokerName", title: "Broker", width: 100, sortOrder: i++, isSelected: true },
            { propertyName: "brokerAmt", title: "B.Amt", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "brokerCCAmt", title: "B.CC Amt", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "partyName", title: "Party", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "transactionNumber", title: "T.No", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "transactionAmt", title: "T.Amt", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "transactionNetAmt", title: "T.Net Amt", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "transactionCCType", title: "T.CC Type", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "transactionCCRate", title: "T.CC Rate", width: 25, sortOrder: i++, isSelected: true },
            { propertyName: "transactionDate", title: "T.Date", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "receiptNumber", title: "R.No", width: 28, sortOrder: i++, isSelected: true },
            { propertyName: "receiptDate", title: "R.Date", width: 35, sortOrder: i++, isSelected: true },
            { propertyName: "paidAmount", title: "Paid Amt", width: 30, sortOrder: i++, isSelected: true },
            { propertyName: "paidDate", title: "Paid Date", width: 35, sortOrder: i++, isSelected: true },
        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

    public getSalesStatisticsItems(): GridDetailConfig[] {
        let i = 1;
        let gridValues: GridDetailConfig[] = [
            { propertyName: "transactionNo", title: "Sale Tran. No", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "refNumber", title: "Invoice No", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "partyLedger.name", title: "Party", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "partyLedger.mobileNo", title: "Party No.", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "broker.name", title: "Broker", width: 85, sortOrder: i++, isSelected: true },
            { propertyName: "broker.mobileNo", title: "Broker No.", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "createdDate", title: "Create Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "transactionDate", title: "Trans. Date", width: 80, sortOrder: i++, isSelected: true },

            { propertyName: "deliveryDate", title: "Deliv. Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "dueDate", title: "Due Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "paymentDate", title: "Pay. Date", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "amount", title: "Amount", width: 80, sortOrder: i++, isSelected: true },
            { propertyName: "additionalAmount", title: "Add. Amt", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "shippingCharge", title: "Shipp. Charge", width: 50, sortOrder: i++, isSelected: true },
            { propertyName: "netTotal", title: "Net Amt", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "ccAmount", title: "CC Amt", width: 70, sortOrder: i++, isSelected: true },
            { propertyName: "paidAmount", title: "Paid Amt", width: 70, sortOrder: i++, isSelected: true },

            { propertyName: "status", title: "Status", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "receiptTransactionNo", title: "Receipt", width: 40, sortOrder: i++, isSelected: true },
            { propertyName: "receiptNetTotal", title: "Rec. Net Amt.", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "receiptType", title: "Type", width: 60, sortOrder: i++, isSelected: true },
            { propertyName: "advancePaymentAmount", title: "Adv. Payment", width: 60, sortOrder: i++, isSelected: true }
        ];
        gridValues.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        return gridValues
    }

}