export function transformLegacyMdx(source: string): string {
  let content = source;

  /*
   * Callout
   *
   * <Callout type="info" title="Important">
   * Text
   * </Callout>
   *
   * becomes:
   *
   * > **Important**
   * >
   * > Text
   */

  content = content.replace(
    /<Callout\b[^>]*?(?:title=["']([^"']+)["'])?[^>]*>\s*([\s\S]*?)\s*<\/Callout>/gi,
    (_match, title: string | undefined, body: string) => {
      const lines = body
        .trim()
        .split("\n")
        .map((line) => `> ${line}`);

      const heading = title ? `> **${title}**\n>\n` : "";

      return `${heading}${lines.join("\n")}`;
    },
  );

  /*
   * Steps / Step
   *
   * <Steps>
   * <Step title="Install">
   * ...
   * </Step>
   * </Steps>
   *
   * becomes regular Markdown sections.
   */

  content = content.replace(
    /<Step\b[^>]*?(?:title=["']([^"']+)["'])?[^>]*>\s*([\s\S]*?)\s*<\/Step>/gi,
    (_match, title: string | undefined, body: string) => {
      const heading = title ? `### ${title}\n\n` : "";

      return `${heading}${body.trim()}\n`;
    },
  );

  content = content.replace(/<\/?Steps\b[^>]*>/gi, "");

  /*
   * Card
   *
   * <Card title="Notes" description="...">
   * Content
   * </Card>
   */

  content = content.replace(
    /<Card\b[^>]*?(?:title=["']([^"']+)["'])?(?:\s+description=["']([^"']+)["'])?[^>]*>\s*([\s\S]*?)\s*<\/Card>/gi,
    (
      _match,
      title: string | undefined,
      description: string | undefined,
      body: string,
    ) => {
      const parts: string[] = [];

      if (title) {
        parts.push(`### ${title}`);
      }

      if (description) {
        parts.push(`*${description}*`);
      }

      if (body.trim()) {
        parts.push(body.trim());
      }

      return parts.join("\n\n");
    },
  );

  /*
   * Tabs / Tab
   *
   * Legacy browsers get the tab contents sequentially.
   */

  content = content.replace(
    /<Tab\b[^>]*?(?:title=["']([^"']+)["'])?[^>]*>\s*([\s\S]*?)\s*<\/Tab>/gi,
    (_match, title: string | undefined, body: string) => {
      return title ? `### ${title}\n\n${body.trim()}\n` : `${body.trim()}\n`;
    },
  );

  content = content.replace(/<\/?Tabs\b[^>]*>/gi, "");

  /*
   * CodeBlock
   */

  content = content.replace(
    /<CodeBlock\b[^>]*>\s*([\s\S]*?)\s*<\/CodeBlock>/gi,
    (_match, body: string) => {
      return `\`\`\`\n${body.trim()}\n\`\`\``;
    },
  );

  /*
   * ApiReference
   *
   * We cannot reproduce interactive API reference functionality on the
   * legacy renderer, so remove the wrapper and retain any textual children.
   */

  content = content.replace(/<\/?ApiReference\b[^>]*>/gi, "");

  /*
   * Remove any remaining known component tags.
   *
   * This prevents unsupported MDX markup from appearing literally.
   */

  content = content.replace(
    /<\/?(?:Callout|Steps|Step|Card|Tabs|Tab|CodeBlock|ApiReference)\b[^>]*>/gi,
    "",
  );

  return content.replace(/\n{3,}/g, "\n\n").trim();
}
