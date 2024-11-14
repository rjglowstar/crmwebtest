import { BaseEntity } from "shared/enitites";
import { LedgerDNorm } from "./dnorm/ledgerdnorm";

export class LedgerSummary extends BaseEntity {
    name!: string;
    description!: string;
    ledger: LedgerDNorm;
    credit: number;
    debit: number;
    total: number;
    lastTransaction!: Date;

    constructor() {
        super();
        this.ledger = new LedgerDNorm();
        this.credit = 0;
        this.debit = 0;
        this.total = 0;
    }
}