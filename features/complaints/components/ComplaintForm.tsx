"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  FileText,
  Mail,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PageHeader from "@/components/page-header";
import StepProgress from "@/components/step-progress";
import Field, { describedBy } from "@/components/field";
import DatePicker from "@/components/date-picker";
import Callout from "@/components/callout";
import { toast } from "sonner";
import { submitComplaint } from "../services/complaints";

const STEPS = ["The business", "What happened", "Evidence", "Your details", "Check answers"] as const;

const CATEGORIES = [
  { value: "Misleading Pricing", hint: "You were charged more than the advertised or shelf price" },
  { value: "Defective Product", hint: "Something you bought was broken, unsafe, or stopped working" },
  { value: "Poor Service", hint: "Work was not done, or was done badly" },
  { value: "False Advertising", hint: "An advert or claim was not true" },
  { value: "Other", hint: "Anything else" },
];

interface FormState {
  businessName: string;
  businessAddress: string;
  category: string;
  incidentDate: string;
  amount: string;
  description: string;
  evidence: File[];
  fullName: string;
  email: string;
  phone: string;
  consent: boolean;
}

const EMPTY: FormState = {
  businessName: "",
  businessAddress: "",
  category: "",
  incidentDate: "",
  amount: "",
  description: "",
  evidence: [],
  fullName: "",
  email: "",
  phone: "",
  consent: false,
};

type Errors = Partial<Record<keyof FormState, string>>;

const validate = (step: number, form: FormState): Errors => {
  const errors: Errors = {};
  if (step === 1 && !form.businessName.trim())
    errors.businessName = "Enter the name of the business";
  if (step === 2) {
    if (!form.category) errors.category = "Select what kind of problem this is";
    if (!form.description.trim()) errors.description = "Describe what happened";
    else if (form.description.trim().length < 20)
      errors.description = "Please give a little more detail - at least a sentence or two";
  }
  if (step === 4) {
    if (!form.fullName.trim()) errors.fullName = "Enter your full name";
    if (!form.email.trim()) errors.email = "Enter your email address so we can send your case reference";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errors.email = "Enter an email address in the correct format, like name@example.com";
    if (!form.consent) errors.consent = "You must confirm this before we can accept your complaint";
  }
  return errors;
};

export default function ComplaintForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [caseRef, setCaseRef] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const errorSummary = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const goTo = (next: number) => {
    setStep(next);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const advance = () => {
    const found = validate(step, form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      requestAnimationFrame(() => errorSummary.current?.focus());
      return;
    }
    goTo(step + 1);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const { caseRef: ref } = await submitComplaint({
        businessName: form.businessName,
        businessAddress: form.businessAddress,
        category: form.category,
        description: form.description,
        incidentDate: form.incidentDate,
        amount: form.amount,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
      });
      setCaseRef(ref);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Could not submit complaint - please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    set("evidence", [...form.evidence, ...Array.from(incoming)]);
  };

  /* ----------------------------------------------------------------- done */

  if (caseRef) {
    return (
      <>
        <PageHeader
          width="prose"
          eyebrow="Complaint submitted"
          title="We have received your complaint"
          lead="Keep your case reference number safe - you need it to track your case."
          crumbs={[{ label: "Home", path: "/" }, { label: "File a complaint" }]}
        />

        <div className="shell-prose py-10">
          <Callout variant="success" title="Your complaint has been logged">
            A confirmation email is on its way to <strong>{form.email}</strong>.
          </Callout>

          <div className="mt-6 rounded-md border-2 border-ink bg-g-100 p-5 sm:p-6">
            <p className="eyebrow">Your case reference number</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[1.75rem] font-bold tracking-[-0.02em] text-ink sm:text-[2rem]" data-numeric="">
                {caseRef}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  navigator.clipboard
                    ?.writeText(caseRef)
                    .then(() => toast.success("Case reference copied"))
                    .catch(() => toast.error("Could not copy - please write it down"))
                }
              >
                <Copy aria-hidden="true" />
                Copy
              </Button>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="display-3 text-ink">What happens next</h2>
            <ol className="mt-5 space-y-0">
              {[
                { title: "We review your complaint", body: "An officer checks the details and decides which division should handle it. This usually takes 5 to 7 business days." },
                { title: "We contact the business", body: "The business is formally notified and asked to respond. You do not need to contact them yourself." },
                { title: "We investigate or mediate", body: "Most cases are settled through mediation. Complex cases may involve an inspection or a formal investigation." },
                { title: "You receive an outcome", body: "We tell you the result and what redress, if any, the business has agreed to." },
              ].map((item, index) => (
                <li key={item.title} className="flex gap-4 border-t border-border py-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-ink text-[0.8125rem] font-bold text-white" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-[0.9375rem] font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-g-600">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
            <Button asChild>
              <Link href="/track">
                Track this case
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="secondary" onClick={() => setShowEmail(true)}>
              <Mail aria-hidden="true" />
              View confirmation email
            </Button>
          </div>

          <Dialog open={showEmail} onOpenChange={setShowEmail}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmation email</DialogTitle>
              </DialogHeader>
              <div className="rounded-md border border-border">
                <dl className="divide-y divide-border text-sm">
                  {[
                    ["To", form.email],
                    ["From", "no-reply@consumerprotection.example"],
                    ["Subject", `Complaint received - ${caseRef}`],
                  ].map(([term, value]) => (
                    <div key={term} className="flex gap-3 px-4 py-2.5">
                      <dt className="w-16 shrink-0 font-semibold text-g-600">{term}</dt>
                      <dd className="min-w-0 break-words text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="prose-editorial border-t border-border bg-g-50 px-4 py-4 text-[0.9375rem]">
                  <p>Dear {form.fullName},</p>
                  <p>
                    Thank you for filing a complaint with the Consumer Protection Division. Your case
                    reference number is <strong>{caseRef}</strong>.
                  </p>
                  <p>
                    We will review your complaint within 5 to 7 business days. You can check its
                    status at any time using your reference number.
                  </p>
                  <p>
                    Regards,
                    <br />
                    Consumer Affairs Division
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </>
    );
  }

  /* ----------------------------------------------------------------- form */

  const errorList = Object.entries(errors) as [keyof FormState, string][];
  const selectedCategory = CATEGORIES.find((item) => item.value === form.category);

  return (
    <>
      <PageHeader
        width="prose"
        title="File a complaint"
        lead="Tell us what happened and we will take it up with the business on your behalf. It is free."
        crumbs={[{ label: "Home", path: "/" }, { label: "File a complaint" }]}
      />

      <div className="shell-prose py-8 sm:py-10">
        <StepProgress steps={[...STEPS]} current={step} className="mb-8" />

        {errorList.length > 0 && (
          <div ref={errorSummary} tabIndex={-1} role="alert" className="mb-8 rounded-md border-2 border-flag bg-white p-5">
            <h2 className="flex items-center gap-2 text-[1.0625rem] font-bold text-flag">
              <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              There {errorList.length === 1 ? "is a problem" : "are problems"} with this page
            </h2>
            <ul className="mt-3 space-y-1.5">
              {errorList.map(([key, message]) => (
                <li key={key}>
                  <a href={`#${key}`} className="text-[0.9375rem] font-semibold text-flag underline decoration-2 underline-offset-4">
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={(event) => { event.preventDefault(); if (step === STEPS.length) submit(); else advance(); }} noValidate>
          {step === 1 && (
            <fieldset className="space-y-7">
              <legend className="display-3 mb-1 text-ink">Which business is this about?</legend>
              <p className="text-[0.9375rem] text-g-600">If you are not sure of the exact registered name, the name on the sign or receipt is fine.</p>
              <Field id="businessName" label="Name of the business" hint="For example, Island Mart Supermarket" error={errors.businessName}>
                <Input id="businessName" value={form.businessName} onChange={(event) => set("businessName", event.target.value)} aria-invalid={Boolean(errors.businessName)} aria-describedby={describedBy("businessName", true, Boolean(errors.businessName))} autoComplete="organization" />
              </Field>
              <Field id="businessAddress" label="Address or location of the business" hint="Street and town is enough. This helps the officer find the right branch." optional>
                <Input id="businessAddress" value={form.businessAddress} onChange={(event) => set("businessAddress", event.target.value)} aria-describedby={describedBy("businessAddress", true, false)} />
              </Field>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="space-y-7">
              <legend className="display-3 mb-1 text-ink">What happened?</legend>
              <Field id="category" label="What kind of problem is this?" error={errors.category}>
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger id="category" aria-invalid={Boolean(errors.category)} aria-describedby={describedBy("category", false, Boolean(errors.category))}>
                    <SelectValue placeholder="Choose the closest match" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory && <p className="mt-2 text-sm text-g-600">{selectedCategory.hint}</p>}
              </Field>

              <div className="grid items-stretch gap-6 sm:grid-cols-2">
                <Field id="incidentDate" label="When did it happen?" hint="An approximate date is fine" optional aligned>
                  <DatePicker id="incidentDate" value={form.incidentDate} onChange={(v) => set("incidentDate", v)} describedBy={describedBy("incidentDate", true, false)} disableFuture />
                </Field>
                <Field id="amount" label="Amount involved (EC$)" hint="Roughly what you paid or lost" optional aligned>
                  <Input id="amount" type="number" inputMode="decimal" step="0.01" min="0" placeholder="0.00" value={form.amount} onChange={(event) => set("amount", event.target.value)} aria-describedby={describedBy("amount", true, false)} />
                </Field>
              </div>

              <Field id="description" label="Describe what happened" hint="Include dates, what you were told, and what you would like to happen. Do not include your bank card or account numbers." error={errors.description}>
                <Textarea id="description" rows={7} value={form.description} onChange={(event) => set("description", event.target.value)} aria-invalid={Boolean(errors.description)} aria-describedby={describedBy("description", true, Boolean(errors.description))} />
                <p className="mt-2 text-sm text-g-600" data-numeric="">{form.description.trim().length} characters</p>
              </Field>
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="space-y-7">
              <legend className="display-3 mb-1 text-ink">Add evidence</legend>
              <p className="text-[0.9375rem] leading-relaxed text-g-600">Photos of receipts, shelf labels, adverts, or the product itself make a case much easier to prove. You can skip this and send evidence later.</p>
              <div>
                <div className="rounded-md border-2 border-dashed border-g-400 bg-white px-6 py-10 text-center">
                  <Upload className="mx-auto h-8 w-8 text-g-600" aria-hidden="true" />
                  <p className="mt-3 text-[0.9375rem] font-semibold text-ink">Add photos or documents</p>
                  <p className="mt-1 text-sm text-g-600">JPG, PNG, or PDF. Up to 10 MB per file.</p>
                  <input ref={fileInput} type="file" id="evidence" multiple accept="image/jpeg,image/png,application/pdf" className="sr-only" onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} />
                  <Button type="button" variant="secondary" className="mt-4" onClick={() => fileInput.current?.click()}>
                    <Paperclip aria-hidden="true" />
                    Choose files
                  </Button>
                </div>
                {form.evidence.length > 0 && (
                  <ul className="mt-4 divide-y divide-border rounded-md border border-border bg-white">
                    {form.evidence.map((file, index) => (
                      <li key={`${file.name}-${index}`} className="flex items-center gap-3 px-4 py-3">
                        <FileText className="h-4 w-4 shrink-0 text-g-600" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-ink">{file.name}</span>
                        <span className="shrink-0 text-sm text-g-600" data-numeric="">{(file.size / 1024).toFixed(0)} KB</span>
                        <button type="button" onClick={() => set("evidence", form.evidence.filter((_, i) => i !== index))} className="flex h-8 shrink-0 items-center gap-1.5 rounded-sm px-2 text-sm font-medium text-flag transition-colors hover:bg-flag-soft">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only sm:not-sr-only">Remove</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </fieldset>
          )}

          {step === 4 && (
            <fieldset className="space-y-7">
              <legend className="display-3 mb-1 text-ink">Your details</legend>
              <p className="text-[0.9375rem] leading-relaxed text-g-600">We need a way to reach you with your case reference and the outcome. Your details are not shared with the business without your agreement.</p>
              <Field id="fullName" label="Your full name" error={errors.fullName}>
                <Input id="fullName" value={form.fullName} onChange={(event) => set("fullName", event.target.value)} aria-invalid={Boolean(errors.fullName)} aria-describedby={describedBy("fullName", false, Boolean(errors.fullName))} autoComplete="name" />
              </Field>
              <Field id="email" label="Email address" hint="We send your case reference number here" error={errors.email}>
                <Input id="email" type="email" inputMode="email" value={form.email} onChange={(event) => set("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy("email", true, Boolean(errors.email))} autoComplete="email" placeholder="name@example.com" />
              </Field>
              <Field id="phone" label="Phone number" hint="An officer may call you if they need to clarify something" optional>
                <Input id="phone" type="tel" inputMode="tel" value={form.phone} onChange={(event) => set("phone", event.target.value)} aria-describedby={describedBy("phone", true, false)} autoComplete="tel" placeholder="+0 000 000 0000" />
              </Field>
              <div className={errors.consent ? "border-l-4 border-l-brick pl-4" : undefined}>
                {errors.consent && (
                  <p id="consent-error" className="mb-2 flex items-start gap-1.5 text-sm font-semibold text-flag">
                    <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
                    {errors.consent}
                  </p>
                )}
                <label htmlFor="consent" className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-white p-4">
                  <Checkbox id="consent" checked={form.consent} onCheckedChange={(checked) => set("consent", checked === true)} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "consent-error" : undefined} className="mt-0.5" />
                  <span className="text-[0.9375rem] leading-relaxed text-ink">The information I have given is true to the best of my knowledge, and I agree that the Consumer Affairs Division may contact the business about this complaint.</span>
                </label>
              </div>
            </fieldset>
          )}

          {step === 5 && (
            <div>
              <h2 className="display-3 text-ink">Check your answers</h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-g-600">Please read this through before you submit. You can change anything from here.</p>
              <dl className="mt-6 divide-y divide-border border-y border-border">
                {[
                  { label: "Business", value: form.businessName, step: 1 },
                  { label: "Address", value: form.businessAddress, step: 1 },
                  { label: "Type of problem", value: form.category, step: 2 },
                  { label: "Date it happened", value: form.incidentDate, step: 2 },
                  { label: "Amount involved", value: form.amount ? `EC$ ${Number(form.amount).toFixed(2)}` : "", step: 2 },
                  { label: "What happened", value: form.description, step: 2 },
                  { label: "Evidence", value: form.evidence.length > 0 ? `${form.evidence.length} file${form.evidence.length === 1 ? "" : "s"} attached` : "", step: 3 },
                  { label: "Your name", value: form.fullName, step: 4 },
                  { label: "Email", value: form.email, step: 4 },
                  { label: "Phone", value: form.phone, step: 4 },
                ].map((row) => (
                  <div key={row.label} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr_auto] sm:items-baseline sm:gap-4">
                    <dt className="text-[0.9375rem] font-semibold text-g-700">{row.label}</dt>
                    <dd className="min-w-0 text-[0.9375rem] break-words whitespace-pre-line text-ink">{row.value || <span className="text-g-600">Not provided</span>}</dd>
                    <dd className="sm:text-right">
                      <button type="button" onClick={() => goTo(row.step)} className="text-sm font-semibold text-ink underline decoration-g-400 underline-offset-4 hover:decoration-ink">
                        Change<span className="sr-only"> {row.label.toLowerCase()}</span>
                      </button>
                    </dd>
                  </div>
                ))}
              </dl>
              <Callout variant="info" className="mt-6">By submitting, you confirm the information above is accurate. Knowingly filing a false complaint is an offence.</Callout>
            </div>
          )}

          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            {step > 1 ? (
              <Button type="button" variant="secondary" onClick={() => goTo(step - 1)}>
                <ArrowLeft aria-hidden="true" />Back
              </Button>
            ) : (
              <Button asChild variant="secondary">
                <Link href="/"><ArrowLeft aria-hidden="true" />Cancel</Link>
              </Button>
            )}
            {step < STEPS.length ? (
              <Button type="submit">Continue<ArrowRight aria-hidden="true" /></Button>
            ) : (
              <Button type="submit" size="lg" disabled={submitting}>
                <Check aria-hidden="true" />
                {submitting ? "Submitting…" : "Submit complaint"}
              </Button>
            )}
          </div>
        </form>

        <div className="mt-10 border-t border-border pt-6">
          <h2 className="text-[0.9375rem] font-semibold text-ink">Need help with this form?</h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-g-600">
            Call the Consumer Affairs Division on{" "}
            <a href="tel:" className="font-semibold text-ink underline decoration-g-400 underline-offset-4 hover:decoration-ink">[telephone number]</a>{" "}
            and an officer will complete it with you over the phone. You can also visit any Consumer Affairs office in person.
          </p>
        </div>
      </div>

      <div className="sr-only" aria-live="polite">Step {step} of {STEPS.length}: {STEPS[step - 1]}</div>
    </>
  );
}
