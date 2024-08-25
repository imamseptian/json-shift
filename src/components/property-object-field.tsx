import { Button } from "@/components/ui/button";
import { ObjectAttribute, Template, TYPES } from "@/schemas/template-schema";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import InputField from "./input-field";
import SelectField from "./select-field";
import TextareaField from "./text-area-field";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const PRIMITIVE_TYPES = TYPES.filter(
  (type) => !["array", "object"].includes(type.value)
);

export default function PropertyObjectField({
  index,
  isArray = false,
}: {
  index: number;
  isArray?: boolean;
}) {
  const { watch, setValue, control } = useFormContext<Template>();

  const [openProperties, setOpenProperties] = useState<string[]>([]);

  const currentAttribute = watch(`attributes.${index}`);

  const currentObjectField = watch(
    isArray ? `attributes.${index}.items` : `attributes.${index}`
  ) as ObjectAttribute;

  const { remove, append } = useFieldArray({
    control,
    name: isArray
      ? `attributes.${index}.items.properties`
      : `attributes.${index}.properties`,
  });

  const currentProperties = currentObjectField?.properties ?? [];

  const handleAddPropertiesAttribute = () => {
    const newIndex = currentProperties.length;
    append({
      name: "",
      type: "string",
      description: "",
    });
    setOpenProperties((prev) => [...prev, `property-field-${newIndex}`]);
  };

  return (
    <div className="mt-5">
      <h4 className="text-md font-semibold text-muted-foreground mb-5">
        Object Properties
      </h4>
      <Accordion
        type="multiple"
        className="space-y-4"
        value={openProperties}
        onValueChange={setOpenProperties}
      >
        {currentProperties.map((property, secondIndex) => (
          <AccordionItem
            value={`property-field-${secondIndex}`}
            className="bg-background border border-accent"
            key={`property-field-${secondIndex}`}
          >
            <AccordionTrigger
              className="px-4 flex justify-between items-center rounded-t-md"
              onCloseClick={() => remove(index)}
            >
              <h3 className="font-bold text-lg w-full text-start">
                {property.name
                  ? `${currentAttribute.name}.${property.name}`
                  : `Object Property ${secondIndex + 1}`}
              </h3>
              <span className="mx-5 capitalize">{property.type}</span>
            </AccordionTrigger>
            <AccordionContent className="p-4">
              <div className="flex gap-4 mb-5">
                <InputField
                  name={
                    isArray
                      ? `attributes.${index}.items.properties.${secondIndex}.name`
                      : `attributes.${index}.properties.${secondIndex}.name`
                  }
                  label="Name"
                  placeholder="Attribute name"
                  className="basis-1/2"
                />
                <SelectField
                  name={
                    isArray
                      ? `attributes.${index}.items.properties.${secondIndex}.type`
                      : `attributes.${index}.properties.${secondIndex}.type`
                  }
                  label="Type"
                  options={PRIMITIVE_TYPES}
                  className="basis-1/2"
                />
              </div>
              <TextareaField
                name={
                  isArray
                    ? `attributes.${index}.items.properties.${secondIndex}.description`
                    : `attributes.${index}.properties.${secondIndex}.description`
                }
                label="Description"
                placeholder="Attribute description"
              />
            </AccordionContent>
          </AccordionItem>
        ))}
        <Button
          type="button"
          variant={"success"}
          className="w-full mt-5"
          onClick={handleAddPropertiesAttribute}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Object Property
        </Button>
      </Accordion>
    </div>
  );
}
