/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useDebounce from "@/hooks/use-debounce";
import { Template } from "@/schemas/template-schema";
import { useTemplateStore } from "@/store/template-store";
import { Circle, CircleCheck, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface TemplateListProps {
  templates: Template[];
  onItemClick: (item: Template) => void;
  onDeleteClick: (item: Template) => void;
}

function TemplateList({
  templates,
  onItemClick,
  onDeleteClick,
}: TemplateListProps) {
  const { selectedTemplate } = useTemplateStore();

  return (
    <ul className="space-y-4">
      { templates.map((template) => {
        const isSelected = selectedTemplate?.id === template.id;
        return (
          <li key={ template.id } className="flex items-center">
            <div
              className={ `w-full cursor-pointer p-4 rounded-lg bg-secondary ${
                isSelected ? "ring-2" : ""
              }` }
              onClick={ () => onItemClick(template) }
            >
              <h3 className="flex items-center gap-2 text-xl font-bold mb-3">
                { isSelected ? <CircleCheck /> : <Circle /> }
                <span>{ template.name }</span>
              </h3>
              <p className="text-muted-foreground text-sm">{ template.url }</p>
            </div>
            <Button
              variant="ghost"
              type="button"
              className="ml-2"
              onClick={ () => onDeleteClick(template) }
              aria-label={ `Delete template ${template.name}` }
            >
              <X className="w-8 h-8" />
            </Button>
          </li>
        );
      }) }
    </ul>
  );
}

export default function BrowseTemplate() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterText, setFilterText]   = useState("");
  const {
    templates, setSelectedTemplate, deleteTemplate,
  } =    useTemplateStore();

  const debouncedFilterText = useDebounce(filterText, 300);

  const isLoading = filterText !== debouncedFilterText;

  const filterTemplate = useCallback(
    (currentTemplates: Template[], filter: string) => {
      const lowerCaseFilter = filter.toLowerCase();
      return currentTemplates.filter(
        (template) => template.name.toLowerCase().includes(lowerCaseFilter)
          || template.url.toLowerCase().includes(lowerCaseFilter),
      );
    },
    [],
  );

  const filteredTemplates = useMemo(
    () => filterTemplate(templates, debouncedFilterText),
    [filterTemplate, templates, debouncedFilterText],
  );

  const handleItemClick = (template: Template) => {
    setSelectedTemplate(template);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (template: Template) => {
    deleteTemplate(template);
  };

  return (
    <Dialog open={ isModalOpen } onOpenChange={ setIsModalOpen }>
      <DialogTrigger asChild>
        <Button variant="success">Browse Templates</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Browse Templates</DialogTitle>
          <DialogDescription>Select or search for a template</DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <input
            id="templateSearch"
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-3"
            placeholder="Search..."
            onChange={ (e) => setFilterText(e.target.value) }
          />
        </div>

        { isLoading ? (
          <p>Loading...</p>
        ) : (
          <TemplateList
            templates={ filteredTemplates }
            onItemClick={ handleItemClick }
            onDeleteClick={ handleDeleteClick }
          />
        ) }

        { filteredTemplates.length === 0 && (
          <p className="text-center">No templates found</p>
        ) }
      </DialogContent>
    </Dialog>
  );
}
