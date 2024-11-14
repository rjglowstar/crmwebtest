import { OrderItem } from "../../entities";

export class OrderSearchResult {
    orderItems: OrderItem[];
    totalCount!: number;

    constructor() {
        this.orderItems = [];
    }
}