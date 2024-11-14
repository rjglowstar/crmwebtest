import { BaseEntity } from "./baseentity";

export class AzureFileStore extends BaseEntity {
    ident!: string;
    identType!: string;
    identName!: string;
    container!: string;
    blobName!: string;
    fileThumbnail!: string;
    fileName!: string;

    constructor() {
        super();
    }
}