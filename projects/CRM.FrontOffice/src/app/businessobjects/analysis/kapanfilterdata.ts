import { CompareSummary } from "./comparesummary";
import { KDetail } from "./kdetail";

export class KapanFilterData {
    kapanName!: string
    diamondDetails: KDetail[]
    summaryDetail: CompareSummary

    constructor() {
        this.diamondDetails = new Array<KDetail>();
        this.summaryDetail = new CompareSummary();
    }
}