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
import { CircleAlert } from "lucide-react";
import AttributeFields from "./attribute-fields";
import InputField from "./input-field";
import { Checkbox } from "./ui/checkbox";

const DEFAULT_TEMPLATE_VALUES: Template = {
  name        : "",
  url         : "",
  attributes  : [],
  ignoreCache : false,
};

interface TemplateFormProps {
  template: Template | null | undefined;
  onFormSubmit: (data: Template, form: UseFormReturn<Template>) => void;
}

/**
 * TemplateForm component for creating and editing templates
 * @param {TemplateFormProps} props - The component props
 * @returns {JSX.Element} The rendered TemplateForm component
 */
export default function TemplateForm({ template, onFormSubmit }: TemplateFormProps): JSX.Element {
  const form = useForm<Template>({
    resolver      : zodResolver(TemplateSchema),
    defaultValues : DEFAULT_TEMPLATE_VALUES,
  });

  const {
    reset, control, handleSubmit, formState: { isSubmitting },
  } = form;

  useEffect(() => {
    reset(template || DEFAULT_TEMPLATE_VALUES);
  }, [template, reset]);

  const onSubmit = async (values: Template) => {
    onFormSubmit(values, form);
  };

  return (
    <Form { ...form }>
      <form onSubmit={ handleSubmit(onSubmit) } className="space-y-6">
        <TemplateInfoCard />
        <WarningAlert />
        <AttributesCard />
        <IgnoreCacheCheckbox control={ control } />
        <Button type="submit" className="w-full" disabled={ isSubmitting }>
          Submit
        </Button>
      </form>
    </Form>
  );
}

/**
 * TemplateInfoCard component for displaying template information fields
 * @returns {JSX.Element} The rendered TemplateInfoCard component
 */
function TemplateInfoCard(): JSX.Element {
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

/**
 * WarningAlert component for displaying important information to users
 * @returns {JSX.Element} The rendered WarningAlert component
 */
function WarningAlert(): JSX.Element {
  return (
    <div className="flex p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
      <CircleAlert className="w-5 h-5 mr-2" />
      <span className="sr-only">Info</span>
      <div>
        <span className="font-medium">Warning alert!</span>
        { ' ' }
        Due to LLM Token limitations per request that can cause a slow process or even an error response, Please note the following :
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
  );
}

/**
 * AttributesCard component for displaying attribute fields
 * @returns {JSX.Element} The rendered AttributesCard component
 */
function AttributesCard(): JSX.Element {
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

/**
 * IgnoreCacheCheckbox component for toggling cache usage
 * @param {Object} props - The component props
 * @param {any} props.control - The form control object
 * @returns {JSX.Element} The rendered IgnoreCacheCheckbox component
 */
function IgnoreCacheCheckbox({ control }: { control: any }): JSX.Element {
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
