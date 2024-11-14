import { ExportConfig } from "./exportconfig";

export class ExportInfo {
    api!: string;
    url!: string;
    ftp!: string;
    ftpHour!: number | null;
    ftpMinute!: number | null;
    userName!: string;
    password!: string;
    addDiscount!: number;
    email!: string;
    emailTime!: Date | null;
    emailDays!: string[];
    configs!: ExportConfig[];
    includeInBusiness!: boolean;
    isHidePrice!: boolean;
    isHideVolDisc!: boolean;

    constructor() {
        this.configs = [];
    }
}