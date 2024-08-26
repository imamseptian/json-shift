import { Button } from "@/components/ui/button";
import { Template, TYPES } from "@/schemas/template-schema";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import InputField from "./input-field";
import PropertiesField from "./property-field";
import SelectField from "./select-field";
import TextareaField from "./text-area-field";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

/**
 * AttributeFields component for managing attribute fields in a template form
 * @returns {JSX.Element} The rendered AttributeFields component
 */
export default function AttributeFields() {
  const { control, watch, formState: { errors } } = useFormContext<Template>();
  const [openItems, setOpenItems]                 = useState<string[]>([]);

  const {
    remove,
    append,
  } = useFieldArray({
    control,
    name: `attributes`,
  });

  const attributes = watch("attributes");

  const handleAddAttribute = () => {
    const newIndex = attributes.length;
    append({
      name        : "",
      type        : "string",
      description : "",
    });
    setOpenItems((prev) => [...prev, `attribute-${newIndex}`]);
  };

  return (
    <div className="w-full">
      <Accordion
        type="multiple"
        className="space-y-4"
        value={ openItems }
        onValueChange={ setOpenItems }
      >
        { attributes.map((attribute, index) => (
          <AttributeAccordionItem
            key={ `attribute-field-${index}` }
            attribute={ attribute }
            index={ index }
            remove={ remove }
          />
        )) }
      </Accordion>
      <Button
        type="button"
        variant="outline"
        onClick={ handleAddAttribute }
        className={ `w-full mt-4 ${errors.attributes && 'border-4 border-destructive'}` }
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Field
      </Button>
      {
        errors.attributes && (
          <p className="text-sm font-medium text-destructive dark:text-destructive-foreground mt-3">{ errors.attributes.message }</p>
        )
      }
    </div>
  );
}

interface AttributeAccordionItemProps {
  attribute: any;
  index: number;
  remove: (index: number) => void;
}

/**
 * AttributeAccordionItem component for rendering individual attribute items
 * @param {AttributeAccordionItemProps} props - The component props
 * @returns {JSX.Element} The rendered AttributeAccordionItem component
 */
function AttributeAccordionItem({ attribute, index, remove }: AttributeAccordionItemProps): JSX.Element {
  return (
    <AccordionItem
      key={ `attribute-field-${index}` }
      value={ `attribute-${index}` }
      className="bg-secondary border-2 border-primary"
    >
      <AccordionTrigger
        className="px-4 flex justify-between items-center bg-secondary text-secondary-foreground rounded-t-md w-full overflow-hidden"
        onCloseClick={ () => remove(index) }
      >
        <h3 className="font-bold text-lg w-full text-start overflow-hidden">
          { attribute.name || `Attribute ${index + 1}` }
        </h3>
        <span className="mx-5 capitalize hidden md:block">{ attribute.type }</span>
      </AccordionTrigger>
      <AccordionContent className="p-4 bg-muted text-muted-foreground">
        <div className="flex gap-4 mb-5">
          <InputField
            name={ `attributes.${index}.name` }
            label="Name"
            placeholder="Attribute name"
            className="basis-1/2"
          />
          <SelectField
            name={ `attributes.${index}.type` }
            label="Type"
            options={ TYPES }
            className="basis-1/2"
          />
        </div>

        <TextareaField
          name={ `attributes.${index}.description` }
          label="Description"
          placeholder="Attribute description"
        />
        <PropertiesField index={ index } />
      </AccordionContent>
    </AccordionItem>
  );
}
