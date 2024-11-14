import { Address } from "shared/businessobjects";
import { BaseEntity } from "shared/enitites";

export class Expomaster extends BaseEntity {
    name!: string;
    address!: Address;
    fromDate!: Date | null;
    toDate!: Date | null;
    isActive!: boolean;
    constructor() {
        super();
        this.address = new Address();
    }
}
