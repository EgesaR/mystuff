import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";

const ALLOWED_COMPONENTS = new Set([
  "Callout",
  "Steps",
  "Step",
  "Card",
  "Tabs",
  "Tab",
  "CodeBlock",
  "ApiReference",
]);

interface ValidationIssue {
  message: string;
  line?: number;
  column?: number;
}

interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export function validateMdx(source: string): ValidationResult {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source);

  const issues: ValidationIssue[] = [];

  visit(tree);

  return {
    valid: issues.length === 0,
    issues,
  };

  function visit(node: any): void {
    switch (node.type) {
      case "mdxjsEsm":
        issues.push({
          message: "Imports and exports are not allowed in documentation.",
          line: node.position?.start.line,
          column: node.position?.start.column,
        });
        break;

      case "mdxTextExpression":
      case "mdxFlowExpression":
        issues.push({
          message: "JavaScript expressions are not allowed in documentation.",
          line: node.position?.start.line,
          column: node.position?.start.column,
        });
        break;

      case "mdxJsxTextElement":
      case "mdxJsxFlowElement": {
        const name = node.name;

        if (name && /^[A-Z]/.test(name) && !ALLOWED_COMPONENTS.has(name)) {
          issues.push({
            message: `Component <${name}> is not allowed.`,
            line: node.position?.start.line,
            column: node.position?.start.column,
          });
        }

        break;
      }
    }

    for (const child of node.children ?? []) {
      visit(child);
    }
  }
}
