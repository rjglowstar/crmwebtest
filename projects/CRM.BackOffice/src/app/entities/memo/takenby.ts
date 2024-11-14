import { BaseEntity } from "shared/enitites";

export class TakenBy extends BaseEntity {
    name!: string;
    contactNo!: string;
    cardIdNo!: string;

    constructor() {
        super();
    }
}