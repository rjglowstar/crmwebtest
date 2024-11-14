export class DayWiseSummary {
    todayOrderCount: number
    todayOrderAmount: number
    weekOrderCount: number
    weekOrderAmount: number
    monthOrderCount: number
    monthOrderAmount: number
    totalCustomersCount: number
    totalOrdersCount: number
    weekOrderPer: number
    customerOrderPer: number
    constructor() {
        this.todayOrderCount = 0;
        this.todayOrderAmount = 0;
        this.weekOrderCount = 0;
        this.weekOrderAmount = 0;
        this.monthOrderCount = 0;
        this.monthOrderAmount = 0;
        this.totalCustomersCount = 0;
        this.totalOrdersCount = 0;
        this.weekOrderPer = 0;
        this.customerOrderPer = 0;
    }
}