import { Brokerage } from "../../entities";

export class BrokerageSearchResult {
    brokerages: Array<Brokerage>
    totalCount!: number

    constructor() {
        this.brokerages = new Array<Brokerage>();
    }

}