"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Skeleton } from "./skeleton";
import { Checkbox } from "./ui/checkbox";

import { Template, TemplateSchema } from "@/schemas/template-schema";
import { useModelStore } from "@/store/model-store";
import { useTemplateStore } from "@/store/template-store";
import { ExecutionTime } from "./execution-time-result";

import { applyValidationErrorsToForm } from "@/lib/error-utils";
import AttributeFields from "./attribute-fields";
import BrowseTemplate from "./browse-template";
import { ExecutionTimeResult } from "./execution-time-result";
import InputField from "./input-field";
import JsonResultView from "./json-result-view";

const DEFAULT_TEMPLATE_VALUES: Template = {
  name: "",
  url: "",
  attributes: [],
  ignoreCache: false,
};

interface ErrorObject {
  title: string;
  message: string;
}

export default function TemplateForm() {
  const {
    templates,
    selectedTemplate,
    setSelectedTemplate,
    addTemplate,
    updateTemplate,
  } = useTemplateStore();
  const { model: selectedModel } = useModelStore();

  const resultRef = useRef<HTMLDivElement>(null);
  const [objectResult, setObjectResult] = useState<any>(null);
  const [errorObject, setErrorObject] = useState<ErrorObject | null>(null);
  const [executionTime, setExecutionTime] = useState<ExecutionTime>({
    scrapeExecutionTime: null,
    embeddingTime: null,
    llmProcessingTime: null,
  });

  const form = useForm<Template>({
    resolver: zodResolver(TemplateSchema),
    defaultValues: DEFAULT_TEMPLATE_VALUES,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (selectedTemplate) {
      reset(selectedTemplate);
      setObjectResult(selectedTemplate.latestResult);
    } else {
      setObjectResult(null);
      reset(DEFAULT_TEMPLATE_VALUES);
    }
  }, [selectedTemplate, reset]);

  const saveTemplate = (currentTemplate: Template) => {
    const updatedTemplate = currentTemplate.id
      ? currentTemplate
      : { ...currentTemplate, id: uuid() };

    if (!currentTemplate.id) {
      addTemplate(updatedTemplate);
    } else {
      updateTemplate(updatedTemplate);
    }

    setSelectedTemplate(updatedTemplate);
  };

  const onSubmit = async (values: Template) => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }

    let templateUuid = values.id;
    if (!templateUuid) {
      templateUuid = uuid();
    }

    setErrorObject(null);
    setObjectResult(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          model: selectedModel,
          id: templateUuid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.code === "VALIDATION_ERROR") {
          // Handle Zod validation error
          applyValidationErrorsToForm(data.details, form.setError);
          setErrorObject({
            title: data?.title ?? "Validation Error",
            message:
              data?.message ?? "Validation failed. Please check your inputs.",
          });
        } else {
          setErrorObject({
            title: data?.title ?? "Unknown error",
            message: data?.message ?? "Unknown error",
          });
        }
      } else {
        setObjectResult(data.answer);
      }

      if (response.ok) {
        if (values.id) {
          const updatedTemplate = {
            ...values,
            latestResult: data?.answer ?? null,
          };
          updateTemplate(updatedTemplate);
        } else {
          const newTemplate = {
            ...values,
            latestResult: data?.answer ?? null,
            id: templateUuid,
          };
          addTemplate(newTemplate);
          setSelectedTemplate(newTemplate);
        }
      }

      setExecutionTime({
        scrapeExecutionTime: data?.scrapeExecutionTime ?? null,
        embeddingTime: data?.embeddingTime ?? null,
        llmProcessingTime: data?.llmProcessingTime ?? null,
      });
    } catch (error) {
      setErrorObject({
        title: (error as Error).name ?? "Internal server error",
        message: (error as Error).message ?? "Please try again later",
      });
    }
  };

  const handleClickNewTemplate = () => reset(DEFAULT_TEMPLATE_VALUES);

  const showErrorMessage = !!errorObject && !isSubmitting;
  const showResults = !isSubmitting && !showErrorMessage;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 basis-1/2 h-fit"
        >
          <div className="flex justify-between">
            <BrowseTemplate />
            {selectedTemplate?.id && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleClickNewTemplate}
              >
                Create New
              </Button>
            )}
          </div>
          <TemplateInfoCard />
          <AttributesCard />
          <IgnoreCacheCheckbox control={control} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Submit
          </Button>
        </form>
      </Form>
      <ResultSection
        resultRef={resultRef}
        isSubmitting={isSubmitting}
        showErrorMessage={showErrorMessage}
        error={errorObject}
        showResults={showResults}
        objectResult={objectResult}
        executionTime={executionTime}
      />
    </div>
  );
}

const TemplateInfoCard = () => (
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

const AttributesCard = () => (
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

const IgnoreCacheCheckbox = ({ control }: { control: any }) => (
  <FormField
    control={control}
    name="ignoreCache"
    render={({ field }) => (
      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
        <FormControl>
          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
    )}
  />
);

const ResultSection = ({
  resultRef,
  isSubmitting,
  showErrorMessage,
  error,
  showResults,
  objectResult,
  executionTime,
}: {
  resultRef: React.RefObject<HTMLDivElement>;
  isSubmitting: boolean;
  showErrorMessage: boolean;
  error: ErrorObject | null;
  showResults: boolean;
  objectResult: any;
  executionTime: ExecutionTime;
}) => (
  <div ref={resultRef} className="basis-1/2">
    {isSubmitting && (
      <Skeleton className="w-full h-64 bg-[#272822] text-[#f8f8f2]" />
    )}
    {showErrorMessage && (
      <div className="w-full flex justify-center items-center min-h-[400px] bg-[#272822] text-[#f8f8f2] font-bold rounded-lg p-6 shadow-md">
        <div className="text-center">
          <h2 className="text-xl mb-2">{error?.title}</h2>
          <p>{error?.message}</p>
        </div>
      </div>
    )}
    {showResults && (
      <>
        <JsonResultView objectResult={objectResult} />
        <ExecutionTimeResult executionTime={executionTime} />
      </>
    )}
  </div>
);
