export class MeasurementCriteria {
    fromDepth!: number | null;
    toDepth!: number | null;
    fromTable!: number | null;
    toTable!: number | null;
    fromLength!: number | null;
    toLength!: number | null;
    fromWidth!: number | null;
    toWidth!: number | null;
    fromHeight!: number | null;
    toHeight!: number | null;
    fromCrownHeight!: number | null;
    toCrownHeight!: number | null;
    fromCrownAngle!: number | null;
    toCrownAngle!: number | null;
    fromPavilionAngle!: number | null;
    toPavilionAngle!: number | null;
    fromPavilionDepth!: number | null;
    toPavilionDepth!: number | null;
    fromGirdlePer!: number | null;
    toGirdlePer!: number | null;
    minGirdle: string[];
    maxGirdle: string[];
    fromRatio!: number | null;
    toRatio!: number | null;

    constructor() {
        this.minGirdle = [];
        this.maxGirdle = [];
    }
}