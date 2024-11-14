import { Suggestion } from "shared/enitites";
export class SuggestionResponse {
    suggestion: Suggestion[];
    totalCount: number;

    constructor() {
        this.suggestion = new Array<Suggestion>();
        this.totalCount = 0;
    }
}