import { SortFieldDescriptor } from "projects/CRM.Customer/src/app/businessobjects/common/sortfielddescriptor"

export class CustomerSearchCriteria {
    companyName: string
    email: string
    mobileNo: string
    country: string
    sellerId: string
    isActive?: boolean
    isOnline?: boolean
    businessNotFoundDays?: number | null;
    renewDays?: number | null;
    sortFieldDescriptors: Array<SortFieldDescriptor> = new Array<SortFieldDescriptor>();

    constructor() {
        this.companyName = "";
        this.email = "";
        this.mobileNo = "";
        this.country = "";
        this.sellerId = "";
        this.isActive = null as any;
        this.isOnline = null as any;
    }
}