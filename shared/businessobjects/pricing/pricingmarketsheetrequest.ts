import { MfgInclusionData } from "./mfginclusiondata";
import { MfgMeasurementData } from "./mfgmeasurementdata";

export class PricingMarketSheetRequest {
    Id!: string;
    Lab!: string;
    Shape!: string;
    Weight!: number;
    Color!: string;
    Clarity!: string;
    Cut!: string;
    Polish!: string;
    Symmetry!: string;
    Flour!: string;
    MGrade!: string;
    IGrade!: string;
    Day!: number;
    InclusionPrice: MfgInclusionData;
    MeasurePrice: MfgMeasurementData;

    constructor() {
        this.InclusionPrice = new MfgInclusionData();
        this.MeasurePrice = new MfgMeasurementData();
    }
}