import { Template } from "@/schemas/template-schema";
import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

const LOCAL_STORAGE_TEMPLATES_KEY = "templates-store";

type StoreType = {
  templates: Template[];
  selectedTemplate: Template | null | undefined;
  setSelectedTemplate: (template: Template | null | undefined) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (template: Template) => void;
  deleteTemplate: (template: Template) => void;
};

type PersistType = (
  config: StateCreator<StoreType>,
  options: PersistOptions<StoreType>
) => StateCreator<StoreType>;

const useTemplateStore = create<StoreType>(
  (persist as PersistType)(
    (set, get) => ({
      templates           : [],
      selectedTemplate    : null,
      setSelectedTemplate : (template) => {
        let selectedTemplate = null;
        if (template) {
          const { ignoreCache, ...restTemplate } = template || {};
          selectedTemplate                       = { ...restTemplate };
        }

        set({ selectedTemplate });
      },
      addTemplate: (template) => {
        const { ignoreCache, ...restTemplate } = template;

        set((state) => ({
          templates: [
            ...state.templates,
            { ...restTemplate, createdAt: new Date(), updatedAt: new Date() },
          ],
        }));
      },
      updateTemplate: (template) => {
        const { ignoreCache, ...restTemplate } = template;

        set((state) => ({
          templates: state.templates.map((t) => (t.id === restTemplate.id
            ? { ...restTemplate, updatedAt: new Date() }
            : t)),
        }));
      },
      deleteTemplate: (template) => {
        const { selectedTemplate } = get();
        const isSelectedTemplate   = template.id === selectedTemplate?.id;

        set((state) => ({
          templates        : state.templates.filter((t) => t.id !== template.id),
          selectedTemplate : isSelectedTemplate ? null : selectedTemplate,
        }));
      },
    }),
    {
      name: LOCAL_STORAGE_TEMPLATES_KEY, // unique name
    },
  ),
);

export { useTemplateStore };
