import { BaseEntity } from "shared/enitites";
import { ExpoInvItem } from "..";
import { SystemUserDNorm } from "../organization/dnorm/systemuserdnorm";

export class ExpoRequests extends BaseEntity {
    number!: number;
    invItems: ExpoInvItem[];
    seller: SystemUserDNorm;
    status!: string;

    constructor() {
        super();
        this.invItems = [];
        this.seller = new SystemUserDNorm();
    }
}
