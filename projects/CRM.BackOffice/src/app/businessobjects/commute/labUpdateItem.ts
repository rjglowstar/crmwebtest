export class LabUpdateItem{
    stoneIds: string[];
    lab! : string;
    updatedBy!: string;

    constructor(){
        this.stoneIds =new Array<string>() ;
    }
}