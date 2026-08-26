import type { ReactNode } from "react";

interface StepProps {
  title?: string;
  children: ReactNode;
}

export function Step({ title, children }: StepProps) {
  return (
    <section className='relative mb-8 last:mb-0'>
      <div className='absolute -left-[2.05rem] top-0 flex size-6 items-center justify-center rounded-full border bg-background text-xs font-semibold'>
        <span className='sr-only'>Step</span>
      </div>

      {title && <h3 className='mb-2 text-lg font-semibold'>{title}</h3>}

      <div className='text-sm leading-7 text-foreground/90'>{children}</div>
    </section>
  );
}
