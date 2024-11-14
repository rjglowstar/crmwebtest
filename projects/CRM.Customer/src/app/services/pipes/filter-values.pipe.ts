import { Pipe, PipeTransform } from "@angular/core";
import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  isCompositeFilterDescriptor,
} from "@progress/kendo-data-query";

const flatten = (filter: CompositeFilterDescriptor): FilterDescriptor[] => {
  const filters = (filter || {}).filters;
  if (!filters) {
    return [];
  }

  return filters.reduce<FilterDescriptor[]>(
    (result, current) =>
      result.concat(
        isCompositeFilterDescriptor(current) ? flatten(current) : [current]
      ),
    []
  );
};

@Pipe({
  name: "filterValues",
})
export class FilterValuesPipe implements PipeTransform {
  public transform(filter: CompositeFilterDescriptor): unknown[] {
    return flatten(filter).map((descriptor) => descriptor.value);
  }
}