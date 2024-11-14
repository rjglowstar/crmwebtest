export class RapUploadResponse {
    success!: boolean;
    notFoundStoneIds: string[];

    constructor() {
        this.notFoundStoneIds = [];
    }
}