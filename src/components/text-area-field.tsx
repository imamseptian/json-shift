"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
}

export default function TextareaField({
  name,
  label,
  ...props
}: TextareaProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={ control }
      name={ name }
      render={ ({ field }) => (
        <FormItem>
          <FormLabel>{ label || name }</FormLabel>
          <FormControl>
            <Textarea { ...props } { ...field } />
          </FormControl>
          <FormMessage />
        </FormItem>
      ) }
    />
  );
}
