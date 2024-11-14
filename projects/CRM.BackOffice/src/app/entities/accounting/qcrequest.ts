import { BaseEntity } from "shared/enitites";
import { EmployeeDNorm } from "../employee/employeednorm";
import { IdentityDNorm } from "../inventory/identityDNorm";
import { InvItem } from "./base/invitem";

export class QcRequest extends BaseEntity {
    leadId!: string;
    leadNo!: number;
    party!: IdentityDNorm;
    seller!: IdentityDNorm;
    qcStoneIds!: Array<InvItem>;
    employee!: EmployeeDNorm
    isRequest!: boolean
    ident!: string;

    constructor() {
        super();
        this.party = new IdentityDNorm();
        this.seller = new IdentityDNorm();
        this.employee = new EmployeeDNorm();
        this.qcStoneIds = new Array<InvItem>();
    }
}