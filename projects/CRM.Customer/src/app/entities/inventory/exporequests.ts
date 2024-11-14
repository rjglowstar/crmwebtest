import { BaseEntity } from "shared/enitites";
import { SystemUserDNorm } from "../organization/dnorm/systemuserdnorm";
import { ExpoInvItem } from "./dnorm/expoinvitem";

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
