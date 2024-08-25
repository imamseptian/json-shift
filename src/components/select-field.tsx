"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";

interface SelectFieldOptions {
  label: string;
  value: string;
}

interface SelectFieldProps {
  name: string;
  label?: string;
  description?: string;
  className?: string;
  options?: SelectFieldOptions[];
}

export default function SelectField({
  name,
  label,
  description,
  className = "",
  options = [],
}: SelectFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={ control }
      name={ name }
      render={ ({ field }) => (
        <FormItem className={ className }>
          <FormLabel>{ label || name }</FormLabel>
          <FormControl>
            <Select onValueChange={ field.onChange } defaultValue={ field.value }>
              <SelectTrigger className="capitalize">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                { options.map((option) => (
                  <SelectItem key={ option.value } value={ option.value }>
                    { option.label }
                  </SelectItem>
                )) }
              </SelectContent>
            </Select>
          </FormControl>
          { description && <FormDescription>{ description }</FormDescription> }
          <FormMessage />
        </FormItem>
      ) }
    />
  );
}
