import { Template } from "@/schemas/template-schema";
import { useFormContext } from "react-hook-form";
import PropertyItemsField from "./property-items-field";
import PropertyObjectField from "./property-object-field";

export default function PropertiesField({ index }: { index: number }) {
  const { watch } = useFormContext<Template>();

  const currentAttribute = watch(`attributes.${index}`);

  if (currentAttribute.type === "object") {
    return <PropertyObjectField index={index} />;
  }

  if (currentAttribute.type === "array") {
    return <PropertyItemsField index={index} />;
  }

  return null;
}
