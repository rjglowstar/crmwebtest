export class InvUpdateRapResponse {
    success : string[];
    error : string[];
    total : number = 0;

    constructor(){
        this.success = [];
        this.error = [];
    }
}