import { SystemUserDNorm } from "../../entities";

export class ExpoUpdate{
    idents!: string[];
    number!: number;
    seller: SystemUserDNorm;
    status!:string;

    constructor(){
        this.idents = new Array<string>();
        this.seller = new SystemUserDNorm();
    }
}