import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";

import { Form, useActionData, useNavigation } from "react-router";

import { SendIcon, CheckIcon } from "@animateicons/react/lucide";

import type { Route } from "./+types/contact";

import { buildMeta } from "~/lib/seo";

import { apiFetch } from "~/lib/api/server";

import SiteHeader from "~/features/site/components/SiteHeader";
import SiteFooter from "~/features/site/components/SiteFooter";

import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";

import { useLegacyIOS } from "~/legacy/hooks/useLegacyIOS";

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "Contact",
    description:
      "Get in touch about My Stuff — bugs, feature requests, or anything else.",
    path: "/contact",
  });

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(100, "Name is too long."),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(254, "Email is too long."),

  subject: z
    .string()
    .trim()
    .min(2, "Please enter a subject.")
    .max(160, "Subject is too long."),

  message: z
    .string()
    .trim()
    .min(10, "Please enter at least 10 characters.")
    .max(5000, "Message is too long."),
});

type ActionData =
  | {
      ok: true;
    }
  | {
      ok: false;
      error?: string;
      fieldErrors?: Record<string, string>;
      values?: {
        name: string;
        email: string;
        subject: string;
        message: string;
      };
    };

export async function action({
  request,
}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();

  const values = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    subject: String(formData.get("subject") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };

  const result = contactSchema.safeParse(values);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0];

      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    return {
      ok: false,
      fieldErrors,
      values,
    };
  }

  try {
    await apiFetch("/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result.data),
    });

    return {
      ok: true,
    };
  } catch (error) {
    console.error("Contact form submission failed:", error);

    return {
      ok: false,
      error: "Something didn't send. Try again in a moment.",
      values,
    };
  }
}

const inputClass =
  "mt-2 h-10 rounded-sm border-border bg-card px-3 text-sm shadow-none focus-visible:border-ring focus-visible:ring-ring/20";

const fieldErrorClass = "mt-1.5 text-xs text-destructive";

type ContactContentProps = {
  isSuccess: boolean;
  actionData: ActionData | undefined;
  submitting: boolean;
  fieldErrors: Record<string, string> | undefined;
  values:
    | {
        name: string;
        email: string;
        subject: string;
        message: string;
      }
    | undefined;
};

function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const legacyIOS = useLegacyIOS();
  const submitting = navigation.state === "submitting";

  const fieldErrors =
    actionData?.ok === false ? actionData.fieldErrors : undefined;

  const values = actionData?.ok === false ? actionData.values : undefined;

  const isSuccess = actionData?.ok === true;

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <SiteHeader />

      <main className='mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20'>
        <p className='font-mono text-[11px] uppercase tracking-[0.2em] text-primary'>
          Contact
        </p>

        <h1
          className='mt-3 text-4xl leading-tight tracking-tight sm:mt-4 sm:text-5xl'
          style={{
            fontFamily: "'Fraunces', serif",
          }}
        >
          Say what's missing.
        </h1>

        <p className='mt-4 max-w-lg text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg'>
          Bug, feature request, or just a question about how something works —
          this goes straight to the person building it.
        </p>

        {legacyIOS ? (
          <LegacyContactContent
            isSuccess={isSuccess}
            actionData={actionData}
            submitting={submitting}
            fieldErrors={fieldErrors}
            values={values}
          />
        ) : (
          <AnimatePresence mode='wait' initial={false}>
            {isSuccess ? (
              <motion.div
                key='success'
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                transition={{
                  duration: 0.25,
                }}
                className='mt-8 rounded-sm border border-l-4 border-l-primary bg-card p-5 shadow-sm sm:mt-10 sm:p-6'
              >
                <div className='flex items-start gap-3'>
                  <CheckIcon
                    size={20}
                    duration={0.7}
                    className='mt-0.5 shrink-0 text-primary'
                  />

                  <div>
                    <p className='font-mono text-[11px] uppercase tracking-[0.18em] text-primary'>
                      Filed
                    </p>

                    <p className='mt-2 text-sm leading-6 text-muted-foreground sm:text-base'>
                      Message received — thanks for writing in. Expect a reply
                      at the email you gave us.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key='form'
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                transition={{
                  duration: 0.25,
                }}
                className='mt-8 sm:mt-10'
              >
                <ContactForm
                  actionData={actionData}
                  submitting={submitting}
                  fieldErrors={fieldErrors}
                  values={values}
                  animated
                  legacyIOS={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function LegacyContactContent({
  isSuccess,
  actionData,
  submitting,
  fieldErrors,
  values,
}: ContactContentProps) {
  if (isSuccess) {
    return (
      <div className='legacy-slide-up mt-8 rounded-sm border border-l-4 border-l-primary bg-card p-5 shadow-sm sm:mt-10 sm:p-6'>
        <div className='flex items-start gap-3'>
          <CheckIcon
            size={20}
            duration={0.7}
            className='mt-0.5 shrink-0 text-primary'
          />

          <div>
            <p className='font-mono text-[11px] uppercase tracking-[0.18em] text-primary'>
              Filed
            </p>

            <p className='mt-2 text-sm leading-6 text-muted-foreground sm:text-base'>
              Message received — thanks for writing in. Expect a reply at the
              email you gave us.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='legacy-slide-up mt-8 sm:mt-10'>
      <ContactForm
        actionData={actionData}
        submitting={submitting}
        fieldErrors={fieldErrors}
        values={values}
        animated={false}
        legacyIOS
      />
    </div>
  );
}

type ContactFormProps = {
  actionData: ActionData | undefined;
  submitting: boolean;
  fieldErrors: Record<string, string> | undefined;
  values:
    | {
        name: string;
        email: string;
        subject: string;
        message: string;
      }
    | undefined;
  animated: boolean;
  legacyIOS: boolean;
};

function ContactForm({
  actionData,
  submitting,
  fieldErrors,
  values,
  animated,
}: ContactFormProps) {
  const errorMessage = actionData?.ok === false ? actionData.error : undefined;

  return (
    <Form method='post' className='space-y-5'>
      <div className='grid gap-5 sm:grid-cols-2'>
        <div>
          <Label
            htmlFor='name'
            className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'
          >
            Name
          </Label>

          <Input
            id='name'
            name='name'
            type='text'
            autoComplete='name'
            required
            defaultValue={values?.name}
            aria-invalid={Boolean(fieldErrors?.name)}
            aria-describedby={fieldErrors?.name ? "name-error" : undefined}
            className={inputClass}
          />

          {fieldErrors?.name ? (
            <p id='name-error' className={fieldErrorClass}>
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <Label
            htmlFor='email'
            className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'
          >
            Email
          </Label>

          <Input
            id='email'
            name='email'
            type='email'
            autoComplete='email'
            required
            defaultValue={values?.email}
            aria-invalid={Boolean(fieldErrors?.email)}
            aria-describedby={fieldErrors?.email ? "email-error" : undefined}
            className={inputClass}
          />

          {fieldErrors?.email ? (
            <p id='email-error' className={fieldErrorClass}>
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <Label
          htmlFor='subject'
          className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'
        >
          Subject
        </Label>

        <Input
          id='subject'
          name='subject'
          type='text'
          required
          defaultValue={values?.subject}
          aria-invalid={Boolean(fieldErrors?.subject)}
          aria-describedby={fieldErrors?.subject ? "subject-error" : undefined}
          className={inputClass}
        />

        {fieldErrors?.subject ? (
          <p id='subject-error' className={fieldErrorClass}>
            {fieldErrors.subject}
          </p>
        ) : null}
      </div>

      <div>
        <Label
          htmlFor='message'
          className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'
        >
          Message
        </Label>

        <Textarea
          id='message'
          name='message'
          required
          rows={5}
          defaultValue={values?.message}
          aria-invalid={Boolean(fieldErrors?.message)}
          aria-describedby={fieldErrors?.message ? "message-error" : undefined}
          className='mt-2 min-h-28 resize-y rounded-sm border-border bg-card px-3 py-2.5 text-sm leading-6 shadow-none focus-visible:border-ring focus-visible:ring-ring/20 sm:min-h-32'
        />

        <div className='mt-1 flex items-start justify-between gap-3'>
          {fieldErrors?.message ? (
            <p id='message-error' className={fieldErrorClass}>
              {fieldErrors.message}
            </p>
          ) : (
            <span />
          )}

          <span className='shrink-0 font-mono text-[10px] text-muted-foreground'>
            Max 5000
          </span>
        </div>
      </div>

      {errorMessage ? (
        <motion.div
          initial={{
            opacity: 0,
            y: -4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className='rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive'
          role='alert'
        >
          {errorMessage}
        </motion.div>
      ) : null}

      <div className='pt-1'>
        <Button
          type='submit'
          disabled={submitting}
          className='h-10 w-full rounded-sm px-4 font-mono text-[11px] uppercase tracking-[0.14em] sm:w-auto'
        >
          <motion.span
            className='flex items-center justify-center gap-2'
            animate={submitting ? { opacity: 0.75 } : { opacity: 1 }}
          >
            <SendIcon size={16} duration={0.7} isAnimated={!submitting} />

            {submitting ? "Sending…" : "Send message"}
          </motion.span>
        </Button>
      </div>
    </Form>
  );
}

export default Contact;
