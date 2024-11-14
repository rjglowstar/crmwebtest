import { BaseEntity } from "shared/enitites"

export class custAddDisc extends BaseEntity {
    id!: string
    companyName!: string;
    stoneId!: string;
    type!: string;
    discount!: number;

    constructor() {
        super();
    }
}