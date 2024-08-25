import chromium from "@sparticuz/chromium";
import * as puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import { env } from "./env";

interface TextContent {
  type: "text";
  content: string;
}

interface LinkContent {
  type: "link";
  text: string;
  url: string;
}

interface ImageContent {
  type: "image";
  src: string;
  alt: string;
}

interface HeadingContent {
  type: "heading";
  level: number;
  content: string;
}

interface ListContent {
  type: "list";
  items: string[];
}

interface TableContent {
  type: "table";
  headers: string[];
  rows: string[][];
}

interface QuoteContent {
  type: "quote";
  content: string;
}

interface MetaContent {
  type: "meta";
  description: string;
}

export type Content =
  | TextContent
  | LinkContent
  | ImageContent
  | HeadingContent
  | ListContent
  | TableContent
  | QuoteContent
  | MetaContent;

export interface GroupedContent {
  group_id: string;
  blocks: Content[];
}

export async function extractGroupedContentFromWeb(
  url: string,
): Promise<GroupedContent[]> {
  let browser = null;

  if (env.NODE_ENV === "development") {
    browser = await puppeteer.launch({
      args     : ["--no-sandbox", "--disable-setuid-sandbox"],
      headless : true,
    });
  } else if (env.NODE_ENV === "production") {
    browser = await puppeteerCore.launch({
      args            : chromium.args,
      defaultViewport : chromium.defaultViewport,
      executablePath  : await chromium.executablePath(),
      headless        : chromium.headless,
    });
  }

  if (!browser) {
    throw new Error("Failed to launch browser");
  }

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    // @ts-ignore
    const content = await page.evaluate<() => GroupedContent[]>(() => {
      const groupedResults: GroupedContent[]  = [];
      let currentGroup: GroupedContent | null = null;
      let groupCounter                        = 0;

      const elementsToIgnore = [
        "nav",
        "footer",
        "header",
        "aside",
        "script",
        "style",
        "noscript",
        "iframe",
      ];
      const classesToIgnore  = ["advertisement", "sidebar", "comment"];

      function shouldIgnoreElement(element: Element): boolean {
        if (elementsToIgnore.includes(element.tagName.toLowerCase())) return true;
        if (element.closest(elementsToIgnore.join(","))) return true;
        for (const className of classesToIgnore) {
          if (element.classList.contains(className)) return true;
        }
        return false;
      }

      function createNewGroup(): GroupedContent {
        groupCounter++;
        return {
          group_id : `group${groupCounter}`,
          blocks   : [],
        };
      }

      function truncateText(text: string, maxLength: number): string {
        return text.length > maxLength
          ? `${text.slice(0, maxLength)}...`
          : text;
      }

      function processElement(element: Element) {
        if (shouldIgnoreElement(element)) return;

        // Start a new group for major structural elements or headings
        if (
          element.tagName.toLowerCase() === "section"
          || element.tagName.toLowerCase() === "article"
          || /^h[1-3]$/i.test(element.tagName)
        ) {
          if (currentGroup && currentGroup.blocks.length > 0) {
            groupedResults.push(currentGroup);
          }
          currentGroup = createNewGroup();
        }

        if (!currentGroup) {
          currentGroup = createNewGroup();
        }

        if (element instanceof HTMLElement && element.offsetParent !== null) {
          let content: Content | null = null;

          if (element instanceof HTMLAnchorElement) {
            const visibleText = element.innerText.trim();
            if (visibleText) {
              content = {
                type : "link",
                text : truncateText(visibleText, 100),
                url  : element.href,
              };
            }
          } else if (element instanceof HTMLImageElement) {
            content = {
              type : "image",
              src  : element.src,
              alt  : truncateText(element.alt || "No alt text provided", 100),
            };
          } else if (/^h[1-6]$/i.test(element.tagName)) {
            content = {
              type    : "heading",
              level   : parseInt(element.tagName.toLowerCase().charAt(1)),
              content : truncateText(element.innerText.trim(), 200),
            };
          } else if (
            element instanceof HTMLUListElement
            || element instanceof HTMLOListElement
          ) {
            const items = Array.from(element.getElementsByTagName("li"))
              .map((li) => truncateText(li.innerText.trim(), 200))
              .filter((text) => text.length > 0);
            if (items.length > 0) {
              content = {
                type: "list",
                items,
              };
            }
          } else if (element instanceof HTMLTableElement) {
            const headers = Array.from(element.getElementsByTagName("th")).map(
              (th) => truncateText(th.innerText.trim(), 100),
            );
            const rows    = Array.from(element.getElementsByTagName("tr")).map(
              (tr) => Array.from(tr.getElementsByTagName("td")).map((td) => truncateText(td.innerText.trim(), 100)),
            );
            if (headers.length > 0 || rows.length > 0) {
              content = {
                type: "table",
                headers,
                rows,
              };
            }
          } else if (element instanceof HTMLQuoteElement) {
            content = {
              type    : "quote",
              content : truncateText(element.innerText.trim(), 500),
            };
          } else {
            const visibleText = element.innerText.trim();
            if (visibleText) {
              content = {
                type    : "text",
                content : truncateText(visibleText, 1000),
              };
            }
          }

          if (content) {
            const currentGroupBlocksLength = currentGroup.blocks.length;
            const contentExists            = currentGroup.blocks.some(
              (currentContent, index) => {
                const isLastTenIndexes = index >= currentGroupBlocksLength - 10;
                if (
                  currentContent.type === "text"
                  && content.type === "text"
                  && isLastTenIndexes
                ) {
                  return currentContent.content.includes(content.content);
                }
                return (
                  JSON.stringify(currentContent) === JSON.stringify(content)
                );
              },
            );
            if (!contentExists) {
              currentGroup.blocks.push(content);
            }
          }
        }

        for (const child of Array.from(element.children)) {
          processElement(child);
        }
      }

      // Extract meta description
      const metaDescription = document.querySelector(
        'meta[name="description"]',
      );
      if (
        metaDescription instanceof HTMLMetaElement
        && metaDescription.content
      ) {
        groupedResults.push({
          group_id : "meta",
          blocks   : [
            {
              type        : "meta",
              description : truncateText(metaDescription.content, 200),
            },
          ],
        });
      }

      processElement(document.body);

      // Add the last group if it exists
      // @ts-ignore
      if (currentGroup && currentGroup?.blocks.length > 0) {
        groupedResults.push(currentGroup);
      }

      return groupedResults;
    });

    return content;
  } finally {
    await browser.close();
  }
}

export async function extractContentsFromWeb(url: string): Promise<Content[]> {
  let browser = null;

  if (env.NODE_ENV === "development") {
    browser = await puppeteer.launch({
      args     : ["--no-sandbox", "--disable-setuid-sandbox"],
      headless : true,
    });
  } else if (env.NODE_ENV === "production") {
    browser = await puppeteerCore.launch({
      args            : chromium.args,
      defaultViewport : chromium.defaultViewport,
      executablePath  : await chromium.executablePath(),
      headless        : chromium.headless,
    });
  }

  if (!browser) {
    throw new Error("Failed to launch browser");
  }

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    // @ts-ignore
    const content = await page.evaluate<() => Content[]>(() => {
      const results: Content[] = [];

      const elementsToIgnore = [
        "nav",
        "footer",
        "header",
        "aside",
        "script",
        "style",
        "noscript",
        "iframe",
      ];
      const classesToIgnore  = ["advertisement", "sidebar", "comment"];

      function shouldIgnoreElement(element: Element): boolean {
        if (elementsToIgnore.includes(element.tagName.toLowerCase())) return true;
        if (element.closest(elementsToIgnore.join(","))) return true;
        for (const className of classesToIgnore) {
          if (element.classList.contains(className)) return true;
        }
        return false;
      }

      function truncateText(text: string, maxLength: number): string {
        return text.length > maxLength
          ? `${text.slice(0, maxLength)}...`
          : text;
      }

      function isContentEqual(
        a: Content,
        b: Content,
        isLastTenIndexes: boolean,
      ): boolean {
        // return JSON.stringify(a) === JSON.stringify(b);
        if (a.type === "text" && b.type === "text" && isLastTenIndexes) {
          return a.content.includes(b.content);
        }
        return JSON.stringify(a) === JSON.stringify(b);
      }

      function addUniqueContent(content: Content) {
        const resultsLength = results.length;
        if (
          !results.some((item, index) => {
            const isLastTenIndexes = index >= resultsLength - 10;
            return isContentEqual(item, content, isLastTenIndexes);
          })
        ) {
          results.push(content);
        }
      }

      function processElement(element: Element) {
        if (shouldIgnoreElement(element)) return;

        if (element instanceof HTMLElement && element.offsetParent !== null) {
          let content: Content | null = null;

          if (element instanceof HTMLAnchorElement) {
            const visibleText = element.innerText.trim();
            if (visibleText) {
              content = {
                type : "link",
                text : truncateText(visibleText, 100),
                url  : element.href,
              };
            }
          } else if (element instanceof HTMLImageElement) {
            content = {
              type : "image",
              src  : element.src,
              alt  : truncateText(element.alt || "No alt text provided", 100),
            };
          } else if (/^h[1-6]$/i.test(element.tagName)) {
            content = {
              type    : "heading",
              level   : parseInt(element.tagName.toLowerCase().charAt(1)),
              content : truncateText(element.innerText.trim(), 200),
            };
          } else if (
            element instanceof HTMLUListElement
            || element instanceof HTMLOListElement
          ) {
            const items = Array.from(element.getElementsByTagName("li"))
              .map((li) => truncateText(li.innerText.trim(), 200))
              .filter((text) => text.length > 0);
            if (items.length > 0) {
              content = {
                type: "list",
                items,
              };
            }
          } else if (element instanceof HTMLTableElement) {
            const headers = Array.from(element.getElementsByTagName("th")).map(
              (th) => truncateText(th.innerText.trim(), 100),
            );
            const rows    = Array.from(element.getElementsByTagName("tr")).map(
              (tr) => Array.from(tr.getElementsByTagName("td")).map((td) => truncateText(td.innerText.trim(), 100)),
            );
            if (headers.length > 0 || rows.length > 0) {
              content = {
                type: "table",
                headers,
                rows,
              };
            }
          } else if (element instanceof HTMLQuoteElement) {
            content = {
              type    : "quote",
              content : truncateText(element.innerText.trim(), 500),
            };
          } else {
            const visibleText = element.innerText.trim();
            if (visibleText) {
              content = {
                type    : "text",
                content : truncateText(visibleText, 1000),
              };
            }
          }

          if (content) {
            addUniqueContent(content);
          }
        }

        for (const child of Array.from(element.children)) {
          processElement(child);
        }
      }

      // Extract meta description
      const metaDescription = document.querySelector(
        'meta[name="description"]',
      );
      if (
        metaDescription instanceof HTMLMetaElement
        && metaDescription.content
      ) {
        addUniqueContent({
          type        : "meta",
          description : truncateText(metaDescription.content, 200),
        });
      }

      processElement(document.body);

      return results;
    });

    return content;
  } finally {
    await browser.close();
  }
}

export function formatContentForLangChain(content: Content[]): string {
  return content
    .map((item) => {
      switch (item.type) {
        case "text":
          return item.content;
        case "link":
          return `[${item.text}](${item.url})`;
        case "image":
          return `[Image: ${item.alt}](${item.src})`;
        case "heading":
          return `${"#".repeat(item.level)} ${item.content}`;
        case "list":
          return item.items.map((i) => `- ${i}`).join("\n");
        case "table":
          return `Table: ${item.headers.join(", ")}\n${item.rows
            .map((row) => row.join(", "))
            .join("\n")}`;
        case "quote":
          return `> ${item.content}`;
        case "meta":
          return `Meta Description: ${item.description}`;
        default:
          return "";
      }
    })
    .join(". ");
}
