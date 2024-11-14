import { ExportColumn } from "./exportcolumn";

export class ExportConfig {
    name!: string;
    format!: string;
    conditions!: string;
    fields: ExportColumn[];
    discountType!: string;
    rapNetPerc!: number;
    lasAccessDate!: string | null;

    constructor() {
        this.fields = [];
    }
}