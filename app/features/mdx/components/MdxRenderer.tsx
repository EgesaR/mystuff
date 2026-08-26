import { useEffect, useState } from "react";
import * as runtime from "react/jsx-runtime";

import { evaluate } from "@mdx-js/mdx";
import type { MDXProps } from "mdx/types";

import { mdxComponents } from "./MdxComponents";
import { MdxErrorBoundary } from "./MdxErrorBoundary";

interface MdxRendererProps {
  content: string;
}

type MDXContentComponent = (props: MDXProps) => React.ReactNode;

type RenderState =
  | {
      status: "idle";
      component: null;
      error: null;
    }
  | {
      status: "loading";
      component: null;
      error: null;
    }
  | {
      status: "ready";
      component: MDXContentComponent;
      error: null;
    }
  | {
      status: "error";
      component: null;
      error: unknown;
    };

export default function MdxRenderer({ content }: MdxRendererProps) {
  const [state, setState] = useState<RenderState>({
    status: "idle",
    component: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function compile() {
      if (!content.trim()) {
        setState({
          status: "idle",
          component: null,
          error: null,
        });

        return;
      }

      setState({
        status: "loading",
        component: null,
        error: null,
      });

      try {
        const result = await evaluate(content, {
          ...runtime,
          development: false,
        });

        if (cancelled) {
          return;
        }

        setState({
          status: "ready",
          component: result.default as MDXContentComponent,
          error: null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("MDX compilation error:", error);

        setState({
          status: "error",
          component: null,
          error,
        });
      }
    }

    void compile();

    return () => {
      cancelled = true;
    };
  }, [content]);

  if (state.status === "idle") {
    return null;
  }

  if (state.status === "loading") {
    return (
      <p className='text-sm text-muted-foreground'>Rendering documentation…</p>
    );
  }

  if (state.status === "error") {
    const message =
      state.error instanceof Error ? state.error.message : "Unknown MDX error.";

    return (
      <div
        role='alert'
        className='rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive'
      >
        <p className='font-medium'>Failed to compile documentation.</p>

        <pre className='mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-destructive/80'>
          {message}
        </pre>
      </div>
    );
  }

  const MdxContent = state.component;

  return (
    <MdxErrorBoundary>
      <MdxContent components={mdxComponents} />
    </MdxErrorBoundary>
  );
}
