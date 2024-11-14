export class ExportRequestData {
    stoneIds: Array<string>;
    requestBy!: string;
    location!: string;

    constructor() {
        this.stoneIds = new Array<string>();
    }
}