import { PriceDNorm } from "./priceDNorm"
import { BaseEntity } from "shared/enitites/common/baseentity"
import { OrganizationDNorm } from '../../businessobjects';
import { IdentityDNorm } from "./identityDNorm";

export class PricingHistory extends BaseEntity {
    stoneId!: string;
    shape!: string;
    color!: string;
    clarity!: string;
    cut!: string;
    polish!: string;
    symmetry!: string;
    fluorescence!: string;
    weight!: number;
    organization: OrganizationDNorm;
    price: PriceDNorm;
    identity: IdentityDNorm

    constructor() {
        super();
        this.organization = new OrganizationDNorm();
        this.price = new PriceDNorm();
        this.identity = new IdentityDNorm();
    }
}