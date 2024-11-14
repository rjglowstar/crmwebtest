import { BaseEntity } from "./baseentity";

export class FileStore extends BaseEntity {
      folderName!: string;
      fileName!: string;
      filePath!: string;
      fileExt!: string;
      fileThumbnail!: string;
      type!: string;
      ident!: string;
      customerIdent!: string;

      constructor() {
            super();
      }
}