export class MfgMeasurementData {
    TblDepth: number | null;
    TblAng: number | null;
    Length: number | null;
    Width: number | null;
    Height: number | null;
    CrHeight: number | null;
    CrAngle: number | null;
    PvlDepth: number | null;
    PvlAngle: number | null;
    StarLength: number | null;
    LowerHalf: number | null;
    GirdlePer: number | null;
    MinGirdle: string;
    MaxGirdle: string;
    Ratio: number | null;

    constructor() {
        this.TblDepth = 0;
        this.TblAng = 0;
        this.Length = 0;
        this.Width = 0;
        this.Height = 0;
        this.CrHeight = 0;
        this.CrAngle = 0;
        this.PvlDepth = 0;
        this.PvlAngle = 0;
        this.StarLength = 0;
        this.LowerHalf = 0;
        this.GirdlePer = 0;
        this.MinGirdle = '';
        this.MaxGirdle = '';
        this.Ratio = 0;
    }
}