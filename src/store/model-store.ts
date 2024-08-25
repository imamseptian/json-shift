import { DEFAULT_LLM_MODEL, LLMModel } from "@/lib/constants";
import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

const MODEL_LOCAL_STORAGE_TEMPLATES_KEY = "llm-model-store";

type ModelStoreType = {
  model: LLMModel;
  setModel: (model: LLMModel) => void;
};

type PersistType = (
  config: StateCreator<ModelStoreType>,
  options: PersistOptions<ModelStoreType>
) => StateCreator<ModelStoreType>;

const useModelStore = create<ModelStoreType>(
  (persist as PersistType)(
    (set, get) => ({
      model: DEFAULT_LLM_MODEL,
      setModel: (model) => set({ model }),
    }),
    {
      name: MODEL_LOCAL_STORAGE_TEMPLATES_KEY,
    }
  )
);

export { useModelStore };
