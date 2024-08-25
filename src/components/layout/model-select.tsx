"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_LLM_MODEL,
  LLM_MODEL_OPTIONS,
  LLMModel,
} from "@/lib/constants";
import { useModelStore } from "@/store/model-store";
import React from "react";

export default function ModelSelect() {
  const { model: selectedModel, setModel } = useModelStore();

  const onModelChange = (model: LLMModel) => {
    setModel(model);
  };

  return (
    <Select
      onValueChange={ onModelChange }
      defaultValue={ DEFAULT_LLM_MODEL }
      value={ selectedModel }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Models" />
      </SelectTrigger>
      <SelectContent>
        { Object.entries(LLM_MODEL_OPTIONS).map(([provider, models]) => (
          <React.Fragment key={ provider }>
            <SelectItem value="group-1" disabled className="font-bold">
              { provider }
            </SelectItem>
            { models.map((model) => (
              <SelectItem key={ `llm-model-option-${model}` } value={ model }>
                { model }
              </SelectItem>
            )) }
          </React.Fragment>
        )) }
      </SelectContent>
    </Select>
  );
}
