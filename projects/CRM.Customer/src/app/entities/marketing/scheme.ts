import { BaseEntity } from "shared/enitites"
import { SchemeDetails } from "../../businessobjects";

export class Scheme extends BaseEntity {
    name!: string;
    startDate!: Date;
    endDate!: Date;
    details: SchemeDetails[];
    origin!: string[];
    isActive!: boolean;
    isOnline!: boolean;

    constructor() {
        super();
        this.details = Array<SchemeDetails>();
    }
}