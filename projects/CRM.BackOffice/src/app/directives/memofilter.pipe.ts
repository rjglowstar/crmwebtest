import { Pipe, PipeTransform } from "@angular/core";
import { InventoryItems } from "../entities";

@Pipe({
    name: "memofilter"
})
export class MemoFilterPipe implements PipeTransform {
    confirmLength: number = 0

    transform(rawNum: InventoryItems[], type: string) {
        if (rawNum.length > 0) {
            if (type == "issue") {
                let inv = rawNum.filter(item => {
                    return (item.isHold || item.isMemo);
                })
                this.confirmLength = inv.length;
            }
            else if (type == "receive") {
                let inv = rawNum.filter(item => {
                    return item.isHold == false && item.isMemo == false;
                })

                this.confirmLength = inv.length;
            }
        }
        return this.confirmLength;
    }
}