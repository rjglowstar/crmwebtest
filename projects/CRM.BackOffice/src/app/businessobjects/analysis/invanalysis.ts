import { InventoryItemInclusion } from "../../entities"
import { InvDNorm } from "./invdnorm"
import { SoldInvDNorm } from "./soldinvdnorm"

export class InvAnalysis{
    stoneId!:string
    kapan!:string
    article!:string
    origin!:string
    RFID!:string
    lab!:string
    labLocation!:string
    labExpense!:number
    certificateNo!:string
    imageUrl!:string
    videoUrl!:string
    status!:string
    inclusion:InventoryItemInclusion
    gradingInvDetail:InvDNorm
    baseInvDetail:InvDNorm
    stockInvDetail:InvDNorm
    soldInvDetail:SoldInvDNorm
    
    constructor(){
        this.inclusion = new InventoryItemInclusion();
        this.gradingInvDetail = new InvDNorm();
        this.baseInvDetail = new InvDNorm();
        this.stockInvDetail = new InvDNorm();
        this.soldInvDetail = new SoldInvDNorm();
    }
}