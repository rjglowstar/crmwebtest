import { Supplier } from "../../entities";

export class SupplierResponse{
    suppliers: Supplier[] = [];
    totalCount!: number;    

    constructor(){ }
}