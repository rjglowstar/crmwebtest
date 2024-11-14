import { SaleAnalysisResponse } from "./saleanalysisresponse";

export class FinalStockSaleAnalysis {
        finalOpeningStock! : number;
        finalOpeningStockWeight! : number;
        finalOpeningStockCount! : number;
        finalAdditionStock! : number;
        finalAdditionStockWeight! : number;
        finalAdditionStockCount! : number;
        finalSaleOpeningStock! : number;
        finalSaleOpeningStockWeight! : number;
        finalSaleOpeningStockCount! : number;
        finalSaleAdditionStock! : number;
        finalSaleAdditionStockWeight! : number;
        finalSaleAdditionStockCount! : number;
        stockSaleAnalyses: SaleAnalysisResponse[]

    constructor() { 
        this.stockSaleAnalyses = [];
    }

}