import { BaseEntity } from "shared/enitites"

export class SavedEmail extends BaseEntity {
    name!: string;
    email!: string;

    constructor() {
        super();
    }
}