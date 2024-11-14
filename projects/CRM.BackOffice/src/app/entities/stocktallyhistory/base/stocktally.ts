import { RFIDClass } from "./rfidclass";

export class StockTally {
    kapan!: string;
    boxSerialNo!: string;
    count: number = 0;
    weight: number = 0;

    memoList: Array<RFIDClass>;
    memoCount: number = 0;
    memoWeight: number = 0;

    transitList: Array<RFIDClass>;
    transitCount: number = 0;
    transitWeight: number = 0;

    labReturnList: Array<RFIDClass>;
    labReturnCount: number = 0;
    labReturnWeight: number = 0;

    deliverySoldList: Array<RFIDClass>;
    deliverySoldCount: number = 0;
    deliverySoldWeight: number = 0;

    deliveryOrderList: Array<RFIDClass>;
    deliveryOrderCount: number = 0;
    deliveryOrderWeight: number = 0;
    //on hand
    stockOnHandList: Array<RFIDClass>;
    stockOnHandCount: number = 0;
    stockOnHandWeight: number = 0;

    //difference
    stockDiffrenceList: Array<RFIDClass>;
    stockDiffrenceCount: number = 0;
    stockDiffrenceWeight: number = 0;

    //difference deliveryPending
    pdDiffrenceList: Array<RFIDClass>;
    pdDiffrenceCount: number = 0;
    pdDiffrenceWeight: number = 0;

    constructor() {
        this.stockDiffrenceList = new Array<RFIDClass>();
        this.pdDiffrenceList = new Array<RFIDClass>();
        this.memoList = new Array<RFIDClass>();
        this.transitList = new Array<RFIDClass>();
        this.stockOnHandList = new Array<RFIDClass>();
        this.labReturnList = new Array<RFIDClass>();
        this.deliverySoldList = new Array<RFIDClass>();
        this.deliveryOrderList = new Array<RFIDClass>();
    }
}