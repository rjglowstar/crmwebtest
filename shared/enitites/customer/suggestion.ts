import { BaseEntity } from "../common/baseentity";

export class Suggestion extends BaseEntity {

    company!: string;
    customerName!: string;
    email!: string;
    description!: string;

    constructor() {
        super();
    }
}