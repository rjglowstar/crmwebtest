import { BaseEntity } from "../common/baseentity";
import { CutDetailDNorm } from './cutDetailDNorm';
import { FancyCutDetailDNorm } from "./fancycutdetaildnorm";
import { GirdlePerDetailDnorm } from "./girdleperdetaildnorm";
import { InclusionConfig } from "./inclusionConfig";
import { MasterDNorm } from './masterDNorm';
import { MeasurementConfig } from "./measurementConfig";

export class MasterConfig extends BaseEntity {
    lab: MasterDNorm[]
    shape: MasterDNorm[]
    colors: MasterDNorm[]
    clarities: MasterDNorm[]
    cps: MasterDNorm[]
    fluorescence: MasterDNorm[]
    cut: MasterDNorm[]
    brownItems: MasterDNorm[]
    greenItems: MasterDNorm[]
    milkyItems: MasterDNorm[]
    shadeItems: MasterDNorm[]
    blackItems: MasterDNorm[]
    whiteItems: MasterDNorm[]
    oCrownItems: MasterDNorm[]
    oTableItems: MasterDNorm[]
    oPavillionItems: MasterDNorm[]
    oGirdleItems: MasterDNorm[]
    gConditionItems: MasterDNorm[]
    eyeCleanItems: MasterDNorm[]
    ktosItems: MasterDNorm[]
    nTableItems: MasterDNorm[]
    nPavillionItems: MasterDNorm[]
    nCrownItems: MasterDNorm[]
    nGirdleItems: MasterDNorm[]
    hNAItems: MasterDNorm[]
    culetItems: MasterDNorm[]
    efocItems: MasterDNorm[]
    efopItems: MasterDNorm[]
    cutDetails: CutDetailDNorm[]
    fancyCutDetails: FancyCutDetailDNorm[]
    girdlePerDetails: GirdlePerDetailDnorm[]
    // Inclusion
    inclusions: MasterDNorm[]
    inclusionConfig: InclusionConfig
    // Measurement
    measurements: MasterDNorm[]
    measurementConfig: MeasurementConfig

    constructor() {
        super();
        this.lab = [];
        this.shape = [];
        this.colors = [];
        this.clarities = [];
        this.cps = [];
        this.fluorescence = [];
        this.cut = [];
        this.brownItems = [];
        this.greenItems = [];
        this.milkyItems = [];
        this.shadeItems = [];
        this.blackItems = [];
        this.whiteItems = [];
        this.oCrownItems = [];
        this.oTableItems = [];
        this.oPavillionItems = [];
        this.oGirdleItems = [];
        this.gConditionItems = [];
        this.eyeCleanItems = [];
        this.ktosItems = [];
        this.nTableItems = [];
        this.nPavillionItems = [];
        this.nCrownItems = [];
        this.nGirdleItems = [];
        this.hNAItems = [];
        this.culetItems = [];
        this.efocItems = [];
        this.efopItems = [];
        this.cutDetails = [];
        this.fancyCutDetails = [];
        this.girdlePerDetails = [];
        this.inclusions = [];
        this.inclusionConfig = new InclusionConfig();
        this.measurements = [];
        this.measurementConfig = new MeasurementConfig();
    }
}