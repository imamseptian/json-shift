import { Button } from '@/components/ui/button';
import { ObjectAttribute, Template, TYPES } from '@/schemas/template-schema';
import { PlusCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import InputField from './input-field';
import SelectField from './select-field';
import TextareaField from './text-area-field';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from './ui/accordion';

// Extracted constant
const PRIMITIVE_TYPES = TYPES.filter((type) => !['array', 'object'].includes(type.value));

interface PropertyObjectFieldProps {
  index: number;
  isArray?: boolean;
}

/**
 * PropertyObjectField component for managing object properties in a form.
 * @param {PropertyObjectFieldProps} props - The component props
 * @returns {React.ReactElement} The rendered component
 */
export default function PropertyObjectField({ index, isArray = false }: PropertyObjectFieldProps): React.ReactElement {
  const { watch, control }                  = useFormContext<Template>();
  const [openProperties, setOpenProperties] = useState<string[]>([]);

  const currentAttribute   = watch(`attributes.${index}`);
  const currentObjectField = watch(
    isArray ? `attributes.${index}.items` : `attributes.${index}`,
  ) as ObjectAttribute;

  const { fields, remove, append } = useFieldArray({
    control,
    name: isArray ? `attributes.${index}.items.properties` : `attributes.${index}.properties`,
  });

  const currentProperties = currentObjectField?.properties ?? [];

  const handleAddPropertiesAttribute = useCallback(() => {
    const newIndex = fields.length;
    append({
      name        : '',
      type        : 'string',
      description : '',
    });
    setOpenProperties((prev) => [...prev, `property-field-${newIndex}`]);
  }, [append, fields.length]);

  return (
    <div className="mt-5">
      <h4 className="text-md font-semibold text-muted-foreground mb-5">Object Properties</h4>
      <Accordion
        type="multiple"
        className="space-y-4"
        value={ openProperties }
        onValueChange={ setOpenProperties }
      >
        { currentProperties.map((field, secondIndex) => (
          <PropertyAccordionItem
            key={ `property-field-${secondIndex}` }
            field={ field }
            index={ secondIndex }
            fieldNamePrefix={
              isArray
                ? `attributes.${index}.items.properties.${secondIndex}`
                : `attributes.${index}.properties.${secondIndex}`
            }
            currentAttribute={ currentAttribute }
            onRemove={ () => remove(secondIndex) }
          />
        )) }
        <Button
          type="button"
          variant="success"
          className="w-full mt-5"
          onClick={ handleAddPropertiesAttribute }
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Object Property
        </Button>
      </Accordion>
    </div>
  );
}

interface PropertyAccordionItemProps {
  field: Record<string, any>;
  fieldNamePrefix: string;
  index: number;
  currentAttribute: any;
  onRemove: () => void;
}

/**
 * PropertyAccordionItem component for rendering individual property items.
 * @param {PropertyAccordionItemProps} props - The component props
 * @returns {React.ReactElement} The rendered component
 */
function PropertyAccordionItem({
  field,
  fieldNamePrefix,
  currentAttribute,
  index,
  onRemove,
}: PropertyAccordionItemProps): React.ReactElement {
  return (
    <AccordionItem
      value={ `property-field-${index}` }
      className="bg-background border border-accent"
    >
      <AccordionTrigger
        className="px-4 flex justify-between items-center rounded-t-md"
        onCloseClick={ onRemove }
      >
        <h3 className="font-bold text-lg w-full text-start">
          { field.name
            ? `${currentAttribute.name}.${field.name}`
            : `Object Property ${index + 1}` }
        </h3>
        <span className="mx-5 capitalize hidden md:block">{ field.type }</span>
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <div className="flex gap-4 mb-5">
          <InputField
            name={ `${fieldNamePrefix}.name` }
            label="Name"
            placeholder="Attribute name"
            className="basis-1/2"
          />
          <SelectField
            name={ `${fieldNamePrefix}.type` }
            label="Type"
            options={ PRIMITIVE_TYPES }
            className="basis-1/2"
          />
        </div>
        <TextareaField
          name={ `${fieldNamePrefix}.description` }
          label="Description"
          placeholder="Attribute description"
        />
      </AccordionContent>
    </AccordionItem>
  );
}
