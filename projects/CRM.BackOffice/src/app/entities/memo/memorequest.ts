import { BaseEntity } from "shared/enitites";
import { LedgerDNorm } from "../accounting/dnorm/ledgerdnorm";
import { EmployeeDNorm } from "../employee/employeednorm";
import { IdentityDNorm } from "../inventory/identityDNorm";
import { InvItem } from "../accounting/base/invitem";

export class MemoRequest extends BaseEntity {
    leadId!: string;
    leadNo!: number;
    party!: LedgerDNorm;
    broker!: LedgerDNorm;
    seller!: IdentityDNorm;
    memoStoneIds!: Array<InvItem>;
    employee!: EmployeeDNorm
    isRequest!: boolean
    ident!: string;
    rate!: number

    constructor() {
        super();
        this.party = new LedgerDNorm();
        this.seller = new IdentityDNorm();
        this.employee = new EmployeeDNorm();
        this.broker = new LedgerDNorm();
        this.memoStoneIds = new Array<InvItem>();
    }
}