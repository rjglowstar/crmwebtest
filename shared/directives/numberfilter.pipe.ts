import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
      name: "numberfilter"
})
export class NumberFilterPipe implements PipeTransform {
      confirmString!: string

      transform(rawNum: string, type: string) {
            if (rawNum) {
                  if (type == "mobile") {
                        let firstCodeStr = rawNum.slice(0, 3);
                        let secondSectionStr = rawNum.slice(3, 6);
                        let thirdSectionStr = rawNum.slice(6, 8);
                        let fourthSectionStr = rawNum.slice(8, 13);

                        this.confirmString = `(${firstCodeStr})${secondSectionStr}-${thirdSectionStr}-${fourthSectionStr}`;
                  }
                  else if (type == "phone") {
                        let firstCodeStr = rawNum.slice(0, 4);
                        let secondSectionStr = rawNum.slice(4, 7);
                        let thirdSectionStr = rawNum.slice(7, 9);
                        let fourthSectionStr = rawNum.slice(9, 11);

                        this.confirmString = `(${firstCodeStr})${secondSectionStr}-${thirdSectionStr}-${fourthSectionStr}`;
                  }
                  else if (type == "fax") {
                        let firstCodeStr = rawNum.slice(0, 3);
                        let secondSectionStr = rawNum.slice(3, 6);
                        let thirdSectionStr = rawNum.slice(6, 10);

                        this.confirmString = `(${firstCodeStr})${secondSectionStr}-${thirdSectionStr}`;
                  }
            }
            return this.confirmString;
      }
}