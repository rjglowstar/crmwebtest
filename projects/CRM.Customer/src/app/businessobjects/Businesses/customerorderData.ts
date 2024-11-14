export class CustomOrderData {
    leadId!: string;
    invId!: string;
    orderNo!: number;
    orderDate!: Date;
    totalPcs!: number;
    totalCarat!: number;
    avgRap!: number;
    avgDiscPer!: number;
    totalAmount!: number;
    totalVowDiscper!: number;
    totalVOWDiscAmount!: number;
    totalPayableAmount!: number;
    pickupLocation!: string;
    location!: string;
    stoneid!: string;
    certifcateNo!: string;
    shape!: string;
    weight!: number;
    color!: string;
    clarity!: string;
    cut!: string;
    polish!: string;
    symmetry!: string;
    flurescence!: string;
    rap!: number | null;
    discount!: number | null;
    vowDiscount!: number | null;
    netAmount!: number | null;
    perCarat!: number | null;
    status!: string;
    leadstatus!: string;
    deliveredDate!: Date;
    platform!: string;
    
    constructor() {

    }
}