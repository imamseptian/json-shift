"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

import { Template, TemplateSchema } from "@/schemas/template-schema";

import AttributeFields from "./attribute-fields";
import InputField from "./input-field";
import { Checkbox } from "./ui/checkbox";

const DEFAULT_TEMPLATE_VALUES: Template = {
  name        : "",
  url         : "",
  attributes  : [],
  ignoreCache : false,
};

export default function TemplateForm(
  {
    template,
    onFormSubmit,
  }: {
    template: Template | null | undefined,
    onFormSubmit: (data: Template, form: UseFormReturn<Template>) => void
  },
) {
  const form = useForm<Template>({
    resolver      : zodResolver(TemplateSchema),
    defaultValues : DEFAULT_TEMPLATE_VALUES,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    if (template) {
      reset(template);
    } else {
      reset(DEFAULT_TEMPLATE_VALUES);
    }
  }, [template, reset]);

  const onSubmit = async (values: Template) => {
    onFormSubmit(values, form);
  };

  return (
    <Form { ...form }>
      <form
        onSubmit={ handleSubmit(onSubmit) }
        className="space-y-6"
      >
        <TemplateInfoCard />
        <AttributesCard />
        <IgnoreCacheCheckbox control={ control } />
        <Button type="submit" className="w-full" disabled={ isSubmitting }>
          Submit
        </Button>
      </form>
    </Form>
  );
}

function TemplateInfoCard() {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-primary">
          Template Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InputField name="name" label="Template Name" />
        <InputField name="url" label="Url" />
      </CardContent>
    </Card>
  );
}

function AttributesCard() {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-primary">
          Attributes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AttributeFields />
      </CardContent>
    </Card>
  );
}

function IgnoreCacheCheckbox({ control }: { control: any }) {
  return (
    <FormField
      control={ control }
      name="ignoreCache"
      render={ ({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox checked={ field.value } onCheckedChange={ field.onChange } />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Ignore Cache</FormLabel>
            <FormDescription>
              Check this option to bypass the scraping cache and fetch fresh data
              from the URL. Note that ignoring the cache may result in longer
              processing times, especially for the first scrape or complex web
              pages.
            </FormDescription>
          </div>
        </FormItem>
      ) }
    />
  );
}
