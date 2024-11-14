import { BaseEntity } from "shared/enitites";

export class AiSuggestions extends BaseEntity {
    customerId!: string;
    stoneId!: string;
    shape!: string;
    color!: string;
    clarity!: string;
    cut!: string;
    polish!: string;
    symmetry!: string;
    fluorescence!: string;
    cps!: string;
    weight!: number;
    lab!: string;
    isleadgenerated: boolean;
    isaisuggestion!: boolean;

    constructor() {
        super();
        this.isleadgenerated = false;
        this.weight = 0;
    }
}