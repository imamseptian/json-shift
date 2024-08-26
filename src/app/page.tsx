'use client';

import {
  useEffect, useRef, useState,
} from "react";
import { UseFormReturn } from "react-hook-form";
import { v4 as uuid } from "uuid";

import BrowseTemplate from "@/components/browse-template";
import { ExecutionTime } from "@/components/execution-time-result";
import ResultSection from "@/components/result-section";
import TemplateForm from "@/components/template-form";
import { Button } from "@/components/ui/button";
import { applyValidationErrorsToForm } from "@/lib/error-utils";
import { ErrorObject } from "@/lib/types";
import { Template } from "@/schemas/template-schema";
import { useModelStore } from "@/store/model-store";
import { useTemplateStore } from "@/store/template-store";

/**
 * Homepage component for template management and execution
 * @returns {JSX.Element} The rendered Homepage component
 */
export default function Homepage(): JSX.Element {
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
    setObjectResult(selectedTemplate?.latestResult ?? null);
  }, [selectedTemplate]);

  /**
   * Handles form submission and API interaction
   * @param {Template} formValues - The form values to be submitted
   * @param {UseFormReturn<Template>} form - The form instance
   */
  const handleSubmit = async (formValues: Template, form: UseFormReturn<Template>) => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }

    setIsSubmitting(true);
    setErrorObject(null);
    setObjectResult(null);

    const templateId = formValues.id || uuid();

    try {
      const response = await fetch("/api/extract", {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({
          ...formValues,
          model : selectedModel,
          id    : templateId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        handleErrorResponse(response, data, form);
      } else {
        handleSuccessResponse(data, formValues, templateId);
      }

      updateExecutionTime(data);
    } catch (error) {
      handleFetchError(error as Error);
    } finally {
      setIsSubmitting(false);
      scrollToResult();
    }
  };

  /**
   * Handles error responses from the API
   * @param {Response} response - The API response
   * @param {any} data - The parsed response data
   * @param {UseFormReturn<Template>} form - The form instance
   */
  const handleErrorResponse = (response: Response, data: any, form: UseFormReturn<Template>) => {
    if (response.status === 422 && data.code === "VALIDATION_ERROR") {
      applyValidationErrorsToForm(data.details, form.setError);
      setErrorObject({
        title   : data?.title ?? "Validation Error",
        message : data?.message ?? "Validation failed. Please check your inputs.",
      });
    } else {
      setErrorObject({
        title   : data?.title ?? "Unknown error",
        message : data?.message ?? "Unknown error",
      });
    }
  };

  /**
   * Handles successful responses from the API
   * @param {any} data - The parsed response data
   * @param {Template} formValues - The submitted form values
   * @param {string} templateId - The template ID
   */
  const handleSuccessResponse = (data: any, formValues: Template, templateId: string) => {
    setObjectResult(data.answer);

    const updatedTemplate = {
      ...formValues,
      latestResult : data?.answer ?? null,
      id           : templateId,
    };

    if (formValues.id) {
      updateTemplate(updatedTemplate);
    } else {
      addTemplate(updatedTemplate);
    }
    setSelectedTemplate(updatedTemplate);
  };

  /**
   * Updates the execution time state
   * @param {any} data - The parsed response data containing execution times
   */
  const updateExecutionTime = (data: any) => {
    setExecutionTime({
      scrapeExecutionTime : data?.scrapeExecutionTime ?? null,
      embeddingTime       : data?.embeddingTime ?? null,
      llmProcessingTime   : data?.llmProcessingTime ?? null,
    });
  };

  /**
   * Handles errors that occur during the fetch operation
   * @param {Error} error - The error object
   */
  const handleFetchError = (error: Error) => {
    setErrorObject({
      title   : error.name ?? "Internal server error",
      message : error.message ?? "Please try again later",
    });
  };

  /**
   * Scrolls to the result section
   */
  const scrollToResult = () => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const showErrorMessage = !!errorObject && !isSubmitting;
  const showResults      = !isSubmitting && !showErrorMessage;

  return (
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
        <TemplateForm template={ selectedTemplate } onFormSubmit={ handleSubmit } />
      </div>
      <div className="basis-1/2 ">
        <ResultSection
          ref={ resultRef }
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
