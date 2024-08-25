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
        <div className="flex p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
          <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Info</span>
          <div>
            <span className="font-medium">Warning alert!</span>
            { ' ' }
            This website is still in development and may experience some limitations. Please note the following:
            <ul className="list-disc list-outside mt-3">
              <li>
                <b>Processing Time:</b>
                { ' ' }
                It might take longer to process requests, especially if the targeted website has extensive content.
              </li>
              <li>
                <b>Content Length:</b>
                { ' ' }
                Very long content from a website can cause difficulties in processing due to token limitations in the language model.
              </li>
              <li>
                <b>Anti-Scraping Security:</b>
                { ' ' }
                Some websites have security measures that may prevent us from extracting information.
              </li>
            </ul>
          </div>
        </div>
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
