import { Template } from "@/schemas/template-schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Constants
const LOCAL_STORAGE_TEMPLATES_KEY = "templates-store";

// Types
interface TemplateState {
  templates: Template[];
  selectedTemplate: Template | null;
}

interface TemplateActions {
  setSelectedTemplate: (template: Template | null) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (template: Template) => void;
  deleteTemplate: (templateId: string) => void;
}

type TemplateStore = TemplateState & TemplateActions;

// Helpers
const stripIgnoreCache = (template: Template): Omit<Template, 'ignoreCache'> => {
  const { ignoreCache, ...rest } = template;
  return rest;
};

const updateTimestamps = (template: Template, isNew = false): Template => ({
  ...template,
  updatedAt: new Date(),
  ...(isNew && { createdAt: new Date() }),
});

// Store
export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      templates        : [],
      selectedTemplate : null,

      setSelectedTemplate: (template) => set({ selectedTemplate: template ? stripIgnoreCache(template) : null }),

      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, updateTimestamps(stripIgnoreCache(template), true)],
      })),

      updateTemplate: (template) => set((state) => ({
        templates: state.templates.map((t) => (t.id === template.id ? updateTimestamps(stripIgnoreCache(template)) : t)),
      })),

      deleteTemplate: (templateId) => set((state) => {
        const newTemplates        = state.templates.filter((t) => t.id !== templateId);
        const newSelectedTemplate = state.selectedTemplate?.id === templateId
          ? null
          : state.selectedTemplate;

        return {
          templates        : newTemplates,
          selectedTemplate : newSelectedTemplate,
        };
      }),
    }),
    {
      name: LOCAL_STORAGE_TEMPLATES_KEY,
    },
  ),
);
