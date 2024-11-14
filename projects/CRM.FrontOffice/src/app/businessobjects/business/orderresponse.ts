import { LeadOrderItem } from "..";

export class OrderResponse {
    orders: LeadOrderItem[];
    totalCount: number;

    constructor() {
          this.orders = [];
          this.totalCount = 0;
    }
}