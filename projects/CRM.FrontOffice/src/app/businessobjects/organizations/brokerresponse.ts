import { Broker } from "../../entities";

export class BrokerResponse {

    broker: Broker[] = [];
    totalCount!: number;
    constructor() {
    }
}
