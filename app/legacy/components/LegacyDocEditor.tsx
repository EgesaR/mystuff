import { Form } from "react-router";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";

interface LegacyDocEditorProps {
  page: {
    title: string;
    category: string;
    content: string;
    order: number;
  };
}

export function LegacyDocEditor({ page }: LegacyDocEditorProps) {
  return (
    <Form method='post' className='space-y-5'>
      <div className='flex gap-2 items-center justify-between'>
        <div>
          <Label htmlFor='legacy-title'>Title</Label>

          <Input
            id='legacy-title'
            name='title'
            defaultValue={page.title}
            className='mt-1.5'
          />
        </div>

        <div>
          <Label htmlFor='legacy-category'>Category</Label>

          <Input
            id='legacy-category'
            name='category'
            defaultValue={page.category}
            className='mt-1.5'
          />
        </div>

        <div>
          <Label htmlFor='legacy-order'>Order</Label>

          <Input
            id='legacy-order'
            name='order'
            type='number'
            defaultValue={page.order}
            className='mt-1.5'
          />
        </div>
      </div>

      <div>
        <Label htmlFor='legacy-content'>Content</Label>

        <Textarea
          id='legacy-content'
          name='content'
          defaultValue={page.content}
          className='mt-1.5 min-h-[60vh] font-mono text-sm leading-6'
          spellCheck={false}
        />
      </div>

      <Button type='submit' className='w-full sm:w-auto'>
        Save changes
      </Button>
    </Form>
  );
}
