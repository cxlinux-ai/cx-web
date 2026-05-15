import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/blog/Callout";
import { CxDemo } from "@/components/blog/CxDemo";
import { CodeBlock } from "@/components/blog/CodeBlock";
import { trackEvent } from "@/lib/analytics";

export function getMDXComponents(slug: string): MDXComponents {
  return {
    // Custom MDX components
    Callout,
    CxDemo,

    // Override <pre> to use our styled CodeBlock
    pre: ({ children, ...props }: any) => {
      const codeEl = (children as any)?.props;
      const lang = codeEl?.className?.replace(/^language-/, "") ?? "";
      const filename = (props as any)["data-filename"] ?? "";
      return (
        <CodeBlock language={lang} filename={filename}>
          {children}
        </CodeBlock>
      );
    },

    // Anchor tags fire outbound click event for external links
    a: ({ href, children, ...props }: any) => {
      const isExternal = href?.startsWith("http");
      return (
        <a
          href={href}
          {...props}
          {...(isExternal
            ? {
                target: "_blank",
                rel: "noopener noreferrer",
                onClick: () =>
                  trackEvent({ category: "engagement", action: "blog_outbound_clicked", label: `${slug}::${href}` }),
              }
            : {})}
        >
          {children}
        </a>
      );
    },
  };
}
