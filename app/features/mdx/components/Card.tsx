import type { ReactNode } from "react";

import {
  Card as ShadcnCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface MdxCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function MdxCard({ title, description, children }: MdxCardProps) {
  return (
    <ShadcnCard className='my-6'>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}

          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent>{children}</CardContent>
    </ShadcnCard>
  );
}
