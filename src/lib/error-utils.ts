import { Template } from "@/schemas/template-schema";
import { Path, UseFormSetError } from "react-hook-form";

export const applyValidationErrorsToForm = (
  errors: any[],
  setError: UseFormSetError<Template>
) => {
  errors.forEach((error) => {
    const path = error.path.join(".") as Path<Template>;
    setError(path, {
      type: "manual",
      message: error.message,
    });
  });
};
