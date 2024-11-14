import { CustomerDNorm } from "./dnorm/customerdnorm";

export class CustomerLoginHistory {
    customer: CustomerDNorm;
    sellerName?: string;
    privateipAddress!: string;
    publicipAddress!: string;
    loginTime?: Date;
    logoutTime?: Date;
    latitude!: string;
    longitude!: string;
    country!: string;
    state!: string;
    city!: string;
    browser!: string;
    browserVersion!: string;
    operatingSystem!: string;
    operatingSystemVersion!: string;
    userAgent!: string;

    constructor() {
        this.customer = new CustomerDNorm();
    }
}