import { Address, Badge, CreditLimit, Name, SocialMedia } from "shared/businessobjects";
import { BaseEntity } from "shared/enitites"
import { OriginValue } from "shared/services";
import { SystemUserDNorm } from "../organization/dnorm/systemuserdnorm";

export class Customer extends BaseEntity {
    name: Name;
    fullName!: string;
    code!: string
    birthDate!: Date;
    origin!: string;
    badge: Badge;
    email!: string;
    countryCode!: string;
    mobile1!: string;
    mobile2!: string;
    phoneNo!: string;
    companyName!: string;
    designation!: string;
    businessType!: string;
    businessEmail!: string;
    businessMobileNo!: string;
    businessPhoneNo!: string;
    address: Address;
    faxNo!: string;
    incomeTaxNo!: string;
    creditLimit: CreditLimit;
    referenceName!: string;
    socialMedias: SocialMedia[];
    seller: SystemUserDNorm;
    discount!: number;
    refId!: number;
    userId!: string;
    cartExpireHour!: number;
    isActive!: boolean;
    businessDate!: Date;
    renewDate!:Date;
    businessProofExpiryDate!: Date;
    
    constructor() {
        super();
        this.name = new Name();
        this.origin = OriginValue.Customer.toString();
        this.badge = new Badge();
        this.address = new Address();
        this.creditLimit = new CreditLimit();
        this.socialMedias = [];
        this.seller = new SystemUserDNorm();
    }
}