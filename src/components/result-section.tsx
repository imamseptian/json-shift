'use client';

import {
  forwardRef,
} from "react";

import { ExecutionTime, ExecutionTimeResult } from "@/components/execution-time-result";
import JsonResultView from "@/components/json-result-view";
import { Skeleton } from "@/components/skeleton";

interface ErrorObject {
  title: string;
  message: string;
}

interface ResultSectionProps {
  isSubmitting: boolean;
  showErrorMessage: boolean;
  error: ErrorObject | null;
  showResults: boolean;
  objectResult: any;
  executionTime: ExecutionTime;
}

/**
 * Result display section component
 * This component is wrapped with forwardRef to allow passing of refs
 */
const ResultSection = forwardRef<HTMLDivElement, ResultSectionProps>(
  (
    {
      isSubmitting,
      showErrorMessage,
      error,
      showResults,
      objectResult,
      executionTime,
    },
    ref,
  ) => {
    if (isSubmitting) {
      return <Skeleton className="w-full h-64 bg-[#272822] text-[#f8f8f2]" />;
    }

    if (showErrorMessage) {
      return (
        <div ref={ ref } className="w-full flex justify-center items-center min-h-[400px] bg-[#272822] text-[#f8f8f2] font-bold rounded-lg p-6 shadow-md">
          <div className="text-center">
            <h2 className="text-xl mb-2">{ error?.title }</h2>
            <p>{ error?.message }</p>
          </div>
        </div>
      );
    }

    if (showResults) {
      return (
        <div ref={ ref }>
          <JsonResultView objectResult={ objectResult } />
          <ExecutionTimeResult executionTime={ executionTime } />
        </div>
      );
    }

    return <div ref={ ref } />;
  },
);

// Set display name for the forwardRef component
ResultSection.displayName = 'ResultSection';

export default ResultSection;
