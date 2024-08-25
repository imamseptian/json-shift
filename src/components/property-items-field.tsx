import { Template, TYPES } from "@/schemas/template-schema";
import { useFormContext } from "react-hook-form";
import PropertyObjectField from "./property-object-field";
import SelectField from "./select-field";

const ITEM_TYPES = TYPES.filter((type) => !["array"].includes(type.value));

export default function PropertyItemsField({ index }: { index: number }) {
  const { watch } = useFormContext<Template>();

  const currentType = watch(`attributes.${index}.items.type`);
  return (
    <>
      <SelectField
        name={ `attributes.${index}.items.type` }
        label="Items"
        options={ ITEM_TYPES }
      />
      { currentType === "object" && (
        <PropertyObjectField index={ index } isArray />
      ) }
    </>
  );
}
