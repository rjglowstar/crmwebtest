import { SocialMedia } from "shared/businessobjects";
import { SearchQuery } from "shared/enitites";
export class CustomerDashboard {
    searchDiamondCount!: number;    
    orderCount!: number;
    aiRecommendedCount!: number;
    newArrivalCount!: number;
    selectedLanguage!: string;
    sellerSocialMedias: SocialMedia[];    
    savedSearches: SearchQuery[]; 

    constructor() {
        this.sellerSocialMedias = [];        
        this.savedSearches = []; 
    }
}