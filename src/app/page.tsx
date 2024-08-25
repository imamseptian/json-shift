'use client';

import BrowseTemplate from "@/components/browse-template";
import { ExecutionTime, ExecutionTimeResult } from "@/components/execution-time-result";
import JsonResultView from "@/components/json-result-view";
import { Skeleton } from "@/components/skeleton";
import TemplateForm from "@/components/template-form";
import { Button } from "@/components/ui/button";
import { applyValidationErrorsToForm } from "@/lib/error-utils";
import { Template } from "@/schemas/template-schema";
import { useModelStore } from "@/store/model-store";
import { useTemplateStore } from "@/store/template-store";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { v4 as uuid } from "uuid";

interface ErrorObject {
  title: string;
  message: string;
}

export default function Homepage() {
  const {
    selectedTemplate,
    setSelectedTemplate,
    addTemplate,
    updateTemplate,
  } = useTemplateStore();
  const { model: selectedModel } = useModelStore();

  const resultRef                         = useRef<HTMLDivElement>(null);
  const [objectResult, setObjectResult]   = useState<any>(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [errorObject, setErrorObject]     = useState<ErrorObject | null>(null);
  const [executionTime, setExecutionTime] = useState<ExecutionTime>({
    scrapeExecutionTime : null,
    embeddingTime       : null,
    llmProcessingTime   : null,
  });

  useEffect(() => {
    if (selectedTemplate) {
      setObjectResult(selectedTemplate?.latestResult ?? null);
    } else {
      setObjectResult(null);
    }
  }, [selectedTemplate]);

  const onSubmit = async (formValues: Template, form: UseFormReturn<Template>) => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }

    const { formState: { isSubmitting: isFormSubmitting } } = form;

    setIsSubmitting(isFormSubmitting);

    let templateUuid = formValues.id;
    if (!templateUuid) {
      templateUuid = uuid();
    }

    setErrorObject(null);
    setObjectResult(null);

    try {
      const response = await fetch("/api/extract", {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({
          ...formValues,
          model : selectedModel,
          id    : templateUuid,
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
            title   : data?.title ?? "Unknown error",
            message : data?.message ?? "Unknown error",
          });
        }
      } else {
        setObjectResult(data.answer);
      }

      if (response.ok) {
        if (formValues.id) {
          const updatedTemplate = {
            ...formValues,
            latestResult: data?.answer ?? null,
          };
          updateTemplate(updatedTemplate);
        } else {
          const newTemplate = {
            ...formValues,
            latestResult : data?.answer ?? null,
            id           : templateUuid,
          };
          addTemplate(newTemplate);
          setSelectedTemplate(newTemplate);
        }
      }

      setExecutionTime({
        scrapeExecutionTime : data?.scrapeExecutionTime ?? null,
        embeddingTime       : data?.embeddingTime ?? null,
        llmProcessingTime   : data?.llmProcessingTime ?? null,
      });
    } catch (error) {
      setErrorObject({
        title   : (error as Error).name ?? "Internal server error",
        message : (error as Error).message ?? "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const showErrorMessage = !!errorObject && !isSubmitting;
  const showResults      = !isSubmitting && !showErrorMessage;

  return (
    <div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="basis-1/2 h-fit">
          <div className="flex justify-between mb-5">
            <BrowseTemplate />
            { selectedTemplate?.id && (
              <Button
                type="button"
                variant="secondary"
                onClick={ () => setSelectedTemplate(null) }
              >
                Create New
              </Button>
            ) }
          </div>
          <TemplateForm template={ selectedTemplate } onFormSubmit={ onSubmit } />
        </div>
        <ResultSection
          resultRef={ resultRef }
          isSubmitting={ isSubmitting }
          showErrorMessage={ showErrorMessage }
          error={ errorObject }
          showResults={ showResults }
          objectResult={ objectResult }
          executionTime={ executionTime }
        />
      </div>
    </div>

  );
}

function ResultSection({
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
}) {
  return (
    <div ref={ resultRef } className="basis-1/2">
      { isSubmitting && (
        <Skeleton className="w-full h-64 bg-[#272822] text-[#f8f8f2]" />
      ) }
      { showErrorMessage && (
        <div className="w-full flex justify-center items-center min-h-[400px] bg-[#272822] text-[#f8f8f2] font-bold rounded-lg p-6 shadow-md">
          <div className="text-center">
            <h2 className="text-xl mb-2">{ error?.title }</h2>
            <p>{ error?.message }</p>
          </div>
        </div>
      ) }
      { showResults && (
        <>
          <JsonResultView objectResult={ objectResult } />
          <ExecutionTimeResult executionTime={ executionTime } />
        </>
      ) }
    </div>
  );
}
