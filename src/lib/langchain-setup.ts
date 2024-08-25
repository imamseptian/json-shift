import {
  ArrayAttribute,
  AttributeType,
  ObjectAttribute,
} from "@/schemas/template-schema";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";
import { DEFAULT_LLM_MODEL } from "./constants";
import { getModel } from "./llm-utils";

// const MAX_TOKENS = 4000;

/**
 * Safely parses a JSON string using a JsonOutputParser.
 * @param {string} jsonString - The JSON string to parse.
 * @returns {Promise<any>} The parsed JSON object.
 * @throws {Error} If the JSON is invalid.
 */
async function safeJsonParse(jsonString: string): Promise<any> {
  try {
    const parser = new JsonOutputParser();
    return await parser.parse(jsonString);
  } catch (error) {
    throw new Error("Invalid JSON LLM output, please try again later.");
  }
}

/**
 * Sets up a LangChain sequence for processing attributes.
 * @param {AttributeType[]} attributes - The attributes to process.
 * @param {string} [modelName=DEFAULT_LLM_MODEL] - The name of the language model to use.
 * @returns {RunnableSequence} A LangChain sequence for processing.
 */
export function setupLangChain(
  attributes: AttributeType[],
  modelName: string = DEFAULT_LLM_MODEL,
): RunnableSequence {
  const query  = generatePromptTemplate(attributes);
  const model  = getModel(modelName);
  const prompt = ChatPromptTemplate.fromTemplate(query);

  return RunnableSequence.from([
    prompt,
    model,
    async (input) => safeJsonParse(input.content),
  ]);
}

/**
 * Generates a list of attribute names.
 * @param {AttributeType[]} attributes - The attributes to list.
 * @returns {string} A formatted string of attribute names.
 */
function generateAttributeList(attributes: AttributeType[]): string {
  return attributes.map((attr) => `- ${attr.name}`).join("\n");
}

/**
 * Generates a schema string from attributes.
 * @param {AttributeType[]} attributes - The attributes to generate the schema from.
 * @returns {string} A formatted schema string.
 */
function generateSchemaString(attributes: AttributeType[]): string {
  return attributes
    .map((attr) => {
      switch (attr.type) {
        case "array":
          return handleArrayAttribute(attr);
        case "object":
          return handleObjectAttribute(attr);
        default:
          return `${attr.name}: "${attr.type}"`;
      }
    })
    .join(", ");
}

/**
 * Handles the schema generation for array attributes.
 * @param {ArrayAttribute} attribute - The array attribute to handle.
 * @returns {string} A formatted schema string for the array attribute.
 */
function handleArrayAttribute(attribute: ArrayAttribute): string {
  const { name, items } = attribute;
  if (items.type === "object" && items.properties) {
    const objectSchema = items.properties
      .map((prop) => `${prop.name}: "${prop.type}"`)
      .join(", ");
    return `${name}: [{{${objectSchema}}}]`;
  }
  return `${name}: ["${items.type}"]`;
}

/**
 * Handles the schema generation for object attributes.
 * @param {ObjectAttribute} attribute - The object attribute to handle.
 * @returns {string} A formatted schema string for the object attribute.
 */
function handleObjectAttribute(attribute: ObjectAttribute): string {
  const { name, properties } = attribute;
  const objectSchema         = properties
    .map((prop) => `${name}.${prop.name}: "${prop.type}"`)
    .join(", ");
  return `{{${objectSchema}}}`;
}

/**
 * Generates descriptions for attributes.
 * @param {AttributeType[]} attributes - The attributes to generate descriptions for.
 * @returns {string} A formatted string of attribute descriptions.
 */
function generateAttributeDescriptions(attributes: AttributeType[]): string {
  return attributes
    .map((attr) => {
      switch (attr.type) {
        case "array":
          return handleArrayDescription(attr);
        case "object":
          return handleObjectDescription(attr);
        default:
          return attr.description
            ? `- ${attr.name}: ${attr.description}`
            : undefined;
      }
    })
    .filter((desc): desc is string => desc !== undefined)
    .join("\n");
}

/**
 * Handles the description generation for array attributes.
 * @param {ArrayAttribute} attribute - The array attribute to handle.
 * @returns {string} A formatted description string for the array attribute.
 */
function handleArrayDescription(attribute: ArrayAttribute): string {
  const { name, description, items } = attribute;
  let arrayDesc                      = description ? `${name} is ${description}, ` : "";
  arrayDesc                         += `${name} is an array of ${items.type}s`;

  if (items.type === "object" && items.properties) {
    arrayDesc += " with the following description:\n";
    arrayDesc += items.properties
      .filter((prop) => prop.description)
      .map((prop) => `- ${name}.${prop.name}: ${prop.description}`)
      .join("\n");
  }

  return arrayDesc;
}

/**
 * Handles the description generation for object attributes.
 * @param {ObjectAttribute} attribute - The object attribute to handle.
 * @returns {string} A formatted description string for the object attribute.
 */
function handleObjectDescription(attribute: ObjectAttribute): string {
  const { name, description, properties } = attribute;
  let objectDesc                          = description ? `${name} is ${description}\n` : "";
  objectDesc                             += `${name} is an object with the following description:\n`;
  objectDesc                             += properties
    .filter((prop) => prop.description)
    .map((prop) => `- ${name}.${prop.name}: ${prop.description}`)
    .join("\n");
  return objectDesc;
}

/**
 * Generates a prompt template for attribute extraction.
 * @param {AttributeType[]} attributes - The attributes to generate the prompt for.
 * @returns {string} A formatted prompt template.
 */
export function generatePromptTemplate(attributes: AttributeType[]): string {
  const listAttributeString = generateAttributeList(attributes);
  const schemaString        = generateSchemaString(attributes);
  const description         = generateAttributeDescriptions(attributes);

  return `
You are an AI assistant designed to extract specific information from web content. Your task is to analyze the given context and extract the requested attributes.

Attributes to extract:
${listAttributeString}

Context:
{context}

Instructions:
1. Carefully read the context and identify the requested information.
2. For each attribute, extract the most accurate and relevant information from the context.
3. If an attribute is not found or unclear, use "N/A" as the value.
4. Ensure all extracted information is factual and directly supported by the context.
5. Respond ONLY with a valid JSON string wrapped in an "output" attribute. Do not include any explanations, comments, or additional text.

Response Format:
- Provide ONLY a valid JSON string wrapped in an "output" attribute.
- Use double quotes for all strings in the JSON.
- For number types, do not use quotes.
- Do not include any text before or after the JSON string.
- Do not include any confidence scores, notes, or explanations.
- Ensure the JSON is properly formatted without any trailing commas.

JSON Schema:
${schemaString}

Attribute Descriptions:
${description}

Generate the JSON string with the requested information. Your entire response must be a single, valid JSON object:
`;
}

/**
 * Sets up a JSON LangChain sequence for processing attributes.
 * Note: Still unstable, sometimes it raise error because LLM cant handle the schema. Will fix later
 * @param {AttributeType[]} attributes - The attributes to process.
 * @param {string} [modelName=DEFAULT_LLM_MODEL] - The name of the language model to use.
 * @returns {RunnableSequence} A LangChain sequence for processing.
 */
export function setupJsonLangChain(
  attributes: AttributeType[],
  modelName: string = DEFAULT_LLM_MODEL,
): RunnableSequence {
  const schema        = createSchemaFromAttributes(attributes);
  const model         = getModel(modelName);
  const structuredLlm = model.withStructuredOutput(schema);

  const prompt = ChatPromptTemplate.fromTemplate(`
  You are an AI assistant designed to extract specific information from web content. Your task is to analyze the given context and extract the requested attributes.

  Context from web content:
  {context}

  Instructions:
  1. Carefully read the context and identify the requested information.
  2. For each attribute, extract the most accurate and relevant information from the context.
  3. If an attribute is not found or unclear, use "N/A" as the value.
  4. Ensure all extracted information is factual and directly supported by the context.
  5. Respond ONLY with a valid JSON string. Do not include any explanations or additional text.

  Response Format:
  - Provide ONLY a valid JSON string.
  - Use double quotes for all strings in the JSON.
  - For number types, do not use quotes.
  - Do not include any text before or after the JSON string.

  Remember to provide answers for all requested attributes. If an attribute is not found and cannot be reasonably inferred, return null for that field.
  `);

  return RunnableSequence.from([
    prompt,
    structuredLlm,
    (input) => {
      console.log(input);
      return input;
    },
  ]);
}

/**
 * Creates a Zod schema for an array attribute.
 * @param {ArrayAttribute} attribute - The array attribute to create a schema for.
 * @returns {z.ZodType} A Zod schema for the array attribute.
 */
function createArrayZod(attribute: ArrayAttribute): z.ZodType {
  const { items, description } = attribute;
  if (items.type === "object" && items.properties) {
    const objectProperties = items.properties.map((attr) => ({
      name        : attr.name,
      type        : attr.type,
      description : attr.description,
    }));
    return z.array(createObjectZod(objectProperties)).describe(description);
  }
  return z.array(
    primitiveZodSchema(
      items.type as "string" | "number" | "boolean",
      description,
    ),
  );
}

interface ObjectProperty {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
}

/**
 * Creates a Zod schema for an object attribute.
 * @param {ObjectProperty[]} properties - The properties of the object attribute.
 * @returns {z.ZodObject} A Zod schema for the object attribute.
 */
function createObjectZod(properties: ObjectProperty[]): z.ZodObject<any> {
  const objectZod = Object.fromEntries(
    properties.map((attr) => [
      attr.name,
      primitiveZodSchema(attr.type, attr.description),
    ]),
  );
  return z.object(objectZod);
}

/**
 * Creates a Zod schema for a primitive type.
 * @param {string} type - The type of the primitive.
 * @param {string} description - The description of the primitive.
 * @returns {z.ZodType} A Zod schema for the primitive type.
 */
const primitiveZodSchema = (
  type: "string" | "number" | "boolean",
  description: string,
): z.ZodType => {
  switch (type) {
    case "string":
      return z.string().describe(description).optional().nullable();
    case "number":
      return z.number().describe(description).optional().nullable();
    case "boolean":
      return z.boolean().describe(description).optional().nullable();
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
};

/**
 * Creates a Zod schema for an attribute.
 * @param {AttributeType} attribute - The attribute to create a schema for.
 * @returns {z.ZodType} A Zod schema for the attribute.
 */
const typeToZod = (attribute: AttributeType): z.ZodType => {
  switch (attribute.type) {
    case "object":
      return createObjectZod(attribute.properties);
    case "array":
      return createArrayZod(attribute);
    default:
      return primitiveZodSchema(attribute.type, attribute.description);
  }
};

/**
 * Creates a Zod schema from attributes.
 * @param {AttributeType[]} attributes - The attributes to create a schema from.
 * @returns {z.ZodObject} A Zod schema for the attributes.
 */
const createSchemaFromAttributes = (
  attributes: AttributeType[],
): z.ZodObject<any> => {
  const shape = Object.fromEntries(
    attributes.map((attr) => [attr.name, typeToZod(attr)]),
  );
  return z.object(shape);
};
