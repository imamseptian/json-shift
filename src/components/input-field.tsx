"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  description?: string;
  className?: string;
}

export default function InputField({
  name,
  label,
  description,
  className = "",
  ...props
}: InputFieldProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={ control }
      name={ name }
      render={ ({ field }) => (
        <FormItem className={ className }>
          <FormLabel>{ label || name }</FormLabel>
          <FormControl>
            <Input { ...props } { ...field } />
          </FormControl>
          { description && <FormDescription>{ description }</FormDescription> }
          <FormMessage />
        </FormItem>
      ) }
    />
  );
}
