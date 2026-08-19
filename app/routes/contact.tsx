import type { Route } from "./+types/contact";
import { buildMeta } from "~/lib/seo";
import { apiFetch } from "~/lib/api";
import { Form, useActionData, useNavigation } from "react-router";
import SiteHeader from "~/features/site/components/SiteHeader";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import SiteFooter from "~/features/site/components/SiteFooter";

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "Contact",
    description:
      "Get in touch about My Stuff — bugs, feature requests, or anything else.",
    path: "/contact",
  });

interface ActionData {
  ok: boolean;
  error?: string;
}

export async function action({
  request,
}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();

  const body = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    subject: String(formData.get("subject") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };

  try {
    await apiFetch("/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return { ok: true };
  } catch (error) {
    console.error("Contact form submission failed:", error);

    return {
      ok: false,
      error: "Something didn't send. Try again in a moment.",
    };
  }
}

const Contact = () => {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-[#F2F1EC] text-[#1C2321]">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#2F5D50]">
          Contact
        </p>

        <h1
          className="mt-4 text-4xl text-[#1C2321] sm:text-5xl"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Say what's missing.
        </h1>

        <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#5B5A50]">
          Bug, feature request, or just a question about how something works —
          this goes straight to the person building it.
        </p>

        <AnimatePresence mode="wait">
          {actionData?.ok ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 rounded-sm border border-[#C9C4B7] bg-[#F8F7F2] p-6"
              style={{ borderLeft: "4px solid #2F5D50" }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#2F5D50]">
                Filed
              </p>

              <p className="mt-2 text-[#5B5A50]">
                Message received — thanks for writing in. Expect a reply at the
                email you gave us.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Form method="post" className="mt-2.5 grid grid-rows-4 gap-2">
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="name"
                      className="font-mono text-xs uppercase tracking-[0.14em] text-[#5B5A50]"
                    >
                      Name
                    </Label>

                    <Input
                      id="name"
                      name="name"
                      required
                      className="mt-2 rounded-sm border-[#C9C4B7] bg-[#F8F7F2]"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className="font-mono text-xs uppercase tracking-[0.14em] text-[#5B5A50]"
                    >
                      Email
                    </Label>

                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="mt-2 rounded-sm border-[#C9C4B7] bg-[#F8F7F2]"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="subject"
                    className="font-mono text-xs uppercase tracking-[0.14em] text-[#5B5A50]"
                  >
                    Subject
                  </Label>

                  <Input
                    id="subject"
                    name="subject"
                    required
                    className="mt-2 rounded-sm border-[#C9C4B7] bg-[#F8F7F2]"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="message"
                    className="font-mono text-xs uppercase tracking-[0.14em] text-[#5B5A50]"
                  >
                    Message
                  </Label>

                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="mt-2 rounded-sm border-[#C9C4B7] bg-[#F8F7F2]"
                  />
                </div>

                {actionData?.error ? (
                  <p className="text-sm text-[#B5462F]">{actionData.error}</p>
                ) : null}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-sm bg-[#2F5D50] font-mono text-xs uppercase tracking-[0.14em] text-[#F2F1EC] hover:bg-[#26493F]"
                >
                  {submitting ? "Sending…" : "Send message"}
                </Button>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Contact;
