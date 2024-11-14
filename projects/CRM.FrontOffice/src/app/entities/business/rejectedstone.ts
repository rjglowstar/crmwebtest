import { BaseEntity } from "shared/enitites";

export class RejectedStone extends BaseEntity {

    invId!: string;
    stoneId!: string;
    rfid!: string;
    shape!: string;
    weight!: number;
    color!: string;
    clarity!: string;
    cut!: string;
    polish!: string;
    symmetry!: string;
    fluorescence!: string;
    location!: string;
    certificateNo!: string;
    removeStoneReason!: string;

    constructor() {
        super();
    }
}