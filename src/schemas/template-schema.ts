import { z } from "zod";

const reservedKeywords = [
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "new",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
  // Strict mode reserved words
  "implements",
  "interface",
  "let",
  "package",
  "private",
  "protected",
  "public",
  "static",
  // Constants
  "null",
  "true",
  "false",
];

// Base schema for all attributes
const BaseAttributeSchema = z.object({
  // name: z.string().min(1, "Cannot be empty"),
  name: z
    .string({
      required_error     : "Name is required",
      invalid_type_error : "Name must be a string",
    })
    .min(1, "Name cannot be empty")
    .regex(
      /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
      "Name must start with a letter, underscore, or dollar sign, and can only contain letters, numbers, underscores, or dollar signs",
    )
    .refine(
      (key) => !reservedKeywords.includes(key),
      "Object key cannot be a reserved JavaScript keyword",
    ),
  description: z.string().min(1, "Cannot be empty"),
});

// Schema for simple attributes (string, number, boolean)
const SimpleAttributeSchema = BaseAttributeSchema.extend({
  type: z.enum(["string", "number", "boolean"]),
});

const ObjectAttributeSchema = BaseAttributeSchema.extend({
  type       : z.literal("object"),
  properties : z.array(SimpleAttributeSchema),
});

const ArrayAttributeSchema = BaseAttributeSchema.extend({
  type  : z.literal("array"),
  items : z.object({
    type       : z.enum(["string", "number", "boolean", "object"]),
    properties : z.array(SimpleAttributeSchema).optional(),
  }),
  // properties: z.array(SimpleAttributeSchema).optional(),
});

export const AttributeSchema = z.discriminatedUnion("type", [
  SimpleAttributeSchema,
  ObjectAttributeSchema,
  ArrayAttributeSchema,
]);

export const TemplateSchema = z.object({
  id           : z.string().optional(),
  url          : z.string().url(),
  name         : z.string().min(1, "Cannot be empty"),
  attributes   : z.array(AttributeSchema).min(1, "Please input at least one attribute"),
  latestResult : z.any().optional(),
  createdAt    : z.union([z.date(), z.string()]).optional(),
  updatedAt    : z.union([z.string(), z.date()]).optional(),
  ignoreCache  : z.boolean().optional(),
});

export type Template = z.infer<typeof TemplateSchema>;
export type ObjectAttribute = z.infer<typeof ObjectAttributeSchema>;
export type ArrayAttribute = z.infer<typeof ArrayAttributeSchema>;
export type AttributeType = z.infer<typeof AttributeSchema>;

export const DEFAULT_TEMPLATE_VALUE: Template = {
  id         : "",
  name       : "",
  url        : "",
  attributes : [
    {
      name        : "",
      type        : "string",
      description : "",
    },
  ],
};

export const TYPES = [
  { label: "String", value: "string" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
  { label: "Array", value: "array" },
  { label: "Object", value: "object" },
];
