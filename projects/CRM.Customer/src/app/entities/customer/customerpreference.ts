import { BaseEntity, ExportInfo, SearchQuery } from "shared/enitites";
import { CustomerDNorm } from "./dnorm/customerdnorm";

export class CustomerPreference extends BaseEntity {
    customer: CustomerDNorm
    exportInfo: ExportInfo
    prefrredStones: SearchQuery[]
    savedSearches: SearchQuery[]
    stoneAlerts: SearchQuery[]

    constructor() {
        super();
        this.customer = new CustomerDNorm();
        this.exportInfo = new ExportInfo();
        this.prefrredStones = [];
        this.savedSearches = [];
        this.stoneAlerts = [];
    }
}