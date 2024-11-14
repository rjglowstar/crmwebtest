import { UserPricingCriteria } from '../../entities';
import { InventorySearchCriteria } from '../inventory/inventorysearchcriteria';

export class PriceRequestApiModel {
    slots?: UserPricingCriteria[];
    invFilter: InventorySearchCriteria;
    type!: string;
    systemUserId!: string;
    selectedCriteriaId!: string;
    skip!: number | null;
    take!: number | null;

    constructor() {
        this.invFilter = new InventorySearchCriteria();
    }
}