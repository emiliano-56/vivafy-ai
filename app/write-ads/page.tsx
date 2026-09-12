
"use client";

import { useState, type ReactNode } from "react";
import { Input as ShadcnInput } from "@/components/ui/input";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VivafyHeader } from "@/components/vivafy-header";
import {
  Sparkles,
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  Wand2,
  RefreshCw,
  ArrowRight,
  Megaphone,
  Target,
  Palette,
  MessageSquareText,
  Loader2,
  Zap,
} from "lucide-react";

const API_BASE_URL = "https://zoop-a1-v2.onrender.com/ads-generator";

type AdResult = {
  product_name: string;

  ad_copy: {
    headline: string;
    primary_text: string;
    short_description: string;
    call_to_action: string;
  };

  visual_concept: {
    concept: string;
    composition: string;
    style: string;
    color_direction: string;
    lighting: string;
  };

  image_prompt: string;
};

export default function Home() {
  const [form, setForm] = useState({
    product_name: "",
    product_description: "",
    audience: "",
    niche: "",
    offer: "",
    platform: "Instagram",
    tone: "Persuasive",
    style: "Modern premium",
    aspect_ratio: "1:1",
  });

  const [adResult, setAdResult] = useState<AdResult | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const [error, setError] = useState("");

  const [copied, setCopied] = useState("");

  const updateForm = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =====================================================
  // GENERATE AD COPY
  // =====================================================

  const generateAd = async () => {
    setError("");
    setAdResult(null);
    setImageUrl("");

    if (
      !form.product_name.trim() ||
      !form.product_description.trim() ||
      !form.audience.trim() ||
      !form.niche.trim()
    ) {
      setError(
        "Please fill in the product, description, audience and niche."
      );
      return;
    }

    try {
      setGeneratingCopy(true);

      const response = await fetch(
        `${API_BASE_URL}/generate-ad`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to generate advertisement."
        );
      }

      if (!data.success || !data.ad) {
        throw new Error("Invalid response from backend.");
      }

      setAdResult(data.ad);
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong while generating the ad."
      );
    } finally {
      setGeneratingCopy(false);
    }
  };

  // =====================================================
  // GENERATE VISUAL
  // =====================================================

  const generateVisual = async () => {
    if (!adResult?.image_prompt) return;

    setError("");
    setImageUrl("");

    try {
      setGeneratingImage(true);

      const response = await fetch(
        `${API_BASE_URL}/generate-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: adResult.image_prompt,
            aspect_ratio: form.aspect_ratio,
            output_format: "png",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to generate visual."
        );
      }

      if (!data.success || !data.image_url) {
        throw new Error(
          "The image generator did not return an image."
        );
      }

      setImageUrl(data.image_url);
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong while generating the visual."
      );
    } finally {
      setGeneratingImage(false);
    }
  };

  // =====================================================
  // COPY TEXT
  // =====================================================

  const copyText = async (
    text: string,
    type: string
  ) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch {
      setError("Unable to copy text.");
    }
  };

  // =====================================================
  // DOWNLOAD IMAGE
  // =====================================================

  const downloadImage = () => {
    if (!imageUrl) return;

    const url =
      `${API_BASE_URL}/download-image?image_url=` +
      encodeURIComponent(imageUrl);

    window.open(url, "_blank");
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* ================================================= */}
      {/* BACKGROUND DECORATION */}
      {/* ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-purple-300/20 blur-[120px]" />

        <div className="absolute right-[-200px] top-[35%] h-[400px] w-[400px] rounded-full bg-fuchsia-300/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[-150px] h-[450px] w-[450px] rounded-full bg-violet-300/10 blur-[120px]" />
      </div>

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <VivafyHeader />

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="relative z-10 px-6 pb-10 pt-14 lg:px-8">

        <div className="mx-auto max-w-4xl text-center">

          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
            <Wand2 className="h-4 w-4" />
            Create ads in seconds
          </div>

          <h2 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">

            Turn your product into

            <span className="block bg-[linear-gradient(90deg,#8b2de2,#17d5da)] bg-clip-text text-transparent">
              scroll-stopping ads.
            </span>

          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Tell us about your product and audience.
            AI writes the advertising copy and creates
            a professional visual asset ready to use.
          </p>

        </div>

      </section>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-[430px_1fr]">

          {/* ================================================= */}
          {/* FORM */}
          {/* ================================================= */}

          <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">

            <div className="mb-7">

              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500">
                <Megaphone className="h-5 w-5 text-white" />
              </div>

              <h3 className="text-xl font-bold">
                Create your advertisement
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Give the AI enough context to create
                relevant, persuasive advertising.
              </p>

            </div>

            <div className="space-y-5">

              {/* Product */}

              <Input
                label="Product or service"
                placeholder="e.g. Vivafy AI"
                value={form.product_name}
                onChange={(value) =>
                  updateForm("product_name", value)
                }
              />

              {/* Description */}

              <Textarea
                label={<span className="inline-flex items-center gap-2"><span>What are you selling?</span><span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500"><img src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/shopify/default.svg" alt="Shopify" className="size-3.5" /><img src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/amazon/default.svg" alt="Amazon" className="size-3.5" /><span>Store links</span></span></span>}
                placeholder="Describe your product, what it does and why people should care — or paste store links"
                value={form.product_description}
                onChange={(value) =>
                  updateForm(
                    "product_description",
                    value
                  )
                }
              />

              {/* Audience */}

              <Select
                label="Target audience"
                value={form.audience}
                options={[
                  "Content creators",
                  "Small business owners",
                  "Marketing professionals",
                  "Startup founders",
                  "Online shoppers",
                  "Students and educators",
                  "Freelancers",
                  "Health and wellness customers",
                  "Ecommerce customers",
                  "Custom",
                ]}
                onChange={(value) => updateForm("audience", value)}
                customValue={form.audience}
                customPlaceholder="Enter a custom audience"
              />

              {/* Niche */}

              <Select
                label="Niche"
                value={form.niche}
                options={[
                  "AI productivity",
                  "SaaS and technology",
                  "Health and wellness",
                  "Personal finance",
                  "Fashion and beauty",
                  "Education",
                  "Food and beverage",
                  "Travel and lifestyle",
                  "Professional services",
                  "Custom",
                ]}
                onChange={(value) => updateForm("niche", value)}
                customValue={form.niche}
                customPlaceholder="Enter a custom niche"
              />

              {/* Offer */}

              <Select
                label="Offer"
                value={form.offer}
                options={[
                  "50% off",
                  "Free trial",
                  "Lifetime access",
                  "Buy one, get one free",
                  "Limited-time bonus",
                  "Free shipping",
                  "Early access",
                  "Bundle discount",
                  "No offer",
                  "Custom",
                ]}
                onChange={(value) => updateForm("offer", value)}
                customValue={form.offer}
                customPlaceholder="Enter a custom offer"
              />

              {/* Platform */}

              <Select
                label="Platform"
                value={form.platform}
                options={[
                  "Instagram",
                  "Facebook",
                  "TikTok",
                  "LinkedIn",
                  "YouTube",
                  "Website",
                ]}
                onChange={(value) =>
                  updateForm("platform", value)
                }
              />

              {/* Tone */}

              <Select
                label="Advertising tone"
                value={form.tone}
                options={[
                  "Persuasive",
                  "Bold",
                  "Luxury",
                  "Friendly",
                  "Professional",
                  "Playful",
                  "Urgent",
                ]}
                onChange={(value) =>
                  updateForm("tone", value)
                }
              />

              {/* Style */}

              <Select
                label="Visual style"
                value={form.style}
                options={[
                  "Modern premium",
                  "Minimal",
                  "Luxury",
                  "Bold and colorful",
                  "Clean corporate",
                  "Futuristic",
                  "Editorial",
                ]}
                onChange={(value) =>
                  updateForm("style", value)
                }
              />

              {/* Aspect Ratio */}

              <Select
                label="Visual format"
                value={form.aspect_ratio}
                options={[
                  "4:5",
                  "1:1",
                  "16:9",
                  "9:16",
                  "3:4",
                  "4:3",
                  "3:2",
                  "2:3",
                  "5:4",
                  "21:9"
                ]}
                onChange={(value) =>
                  updateForm("aspect_ratio", value)
                }
              />

              {/* Error */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Generate */}

              <button
                onClick={generateAd}
                disabled={generatingCopy}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#8b2de2,#17d5da)] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition hover:scale-[1.01] hover:shadow-purple-500/35 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {generatingCopy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Writing your ad...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Ad Copy
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </>
                )}

              </button>

            </div>

          </div>

          {/* ================================================= */}
          {/* RESULTS */}
          {/* ================================================= */}

          <div className="min-w-0">

            {!adResult && !generatingCopy && (
              <EmptyState />
            )}

            {generatingCopy && (
              <LoadingState
                title="Writing your advertisement"
                description="Analyzing your product, audience and marketing angle..."
              />
            )}

            {adResult && !generatingCopy && (
              <div className="space-y-6">

                {/* ================================================= */}
                {/* COPY CARD */}
                {/* ================================================= */}

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/30 sm:p-8">

                  <div className="mb-7 flex items-start justify-between gap-4">

                    <div>

                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-600">
                        <MessageSquareText className="h-4 w-4" />
                        Generated ad copy
                      </div>

                      <h3 className="text-2xl font-bold text-slate-950">
                        Your marketing message
                      </h3>

                    </div>

                    <button
                      onClick={() =>
                        copyText(
                          `${adResult.ad_copy.headline}

${adResult.ad_copy.primary_text}

${adResult.ad_copy.short_description}

CTA: ${adResult.ad_copy.call_to_action}`,
                          "all"
                        )
                      }
                      className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                    >
                      {copied === "all" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}

                      <span className="hidden sm:inline">
                        {copied === "all"
                          ? "Copied"
                          : "Copy all"}
                      </span>
                    </button>

                  </div>

                  <div className="space-y-5">

                    <CopyField
                      label="Headline"
                      value={adResult.ad_copy.headline}
                      copied={
                        copied === "headline"
                      }
                      onCopy={() =>
                        copyText(
                          adResult.ad_copy.headline,
                          "headline"
                        )
                      }
                    />

                    <CopyField
                      label="Primary text"
                      value={adResult.ad_copy.primary_text}
                      copied={
                        copied === "primary"
                      }
                      onCopy={() =>
                        copyText(
                          adResult.ad_copy.primary_text,
                          "primary"
                        )
                      }
                    />

                    <CopyField
                      label="Short description"
                      value={
                        adResult.ad_copy
                          .short_description
                      }
                      copied={
                        copied === "description"
                      }
                      onCopy={() =>
                        copyText(
                          adResult.ad_copy
                            .short_description,
                          "description"
                        )
                      }
                    />

                    <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-fuchsia-50 p-5">

                      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-purple-600">
                        Call to action
                      </div>

                      <div className="flex items-center justify-between gap-4">

                        <div className="font-bold text-slate-950">
                          {
                            adResult.ad_copy
                              .call_to_action
                          }
                        </div>

                        <button
                          onClick={() =>
                            copyText(
                              adResult.ad_copy
                                .call_to_action,
                              "cta"
                            )
                          }
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-purple-600"
                        >
                          {copied === "cta" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

                {/* ================================================= */}
                {/* VISUAL GENERATION */}
                {/* ================================================= */}

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/30 sm:p-8">

                  <div className="mb-6">

                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-600">
                      <ImageIcon className="h-4 w-4" />
                      Visual asset
                    </div>

                    <h3 className="text-2xl font-bold">
                      Bring the ad to life
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Generate a professional visual based
                      on the advertising strategy above.
                    </p>

                  </div>

                  {!imageUrl && (
                    <div className="rounded-2xl border border-dashed border-purple-200 bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/50 p-8 text-center">

                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-lg shadow-purple-500/20">

                        {generatingImage ? (
                          <Loader2 className="h-7 w-7 animate-spin text-white" />
                        ) : (
                          <Palette className="h-7 w-7 text-white" />
                        )}

                      </div>

                      <h4 className="text-lg font-bold">
                        {generatingImage
                          ? "Creating your visual..."
                          : "Your visual is ready to generate"}
                      </h4>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        {generatingImage
                          ? "The AI is creating the advertising creative. This may take a little while."
                          : "Generate a polished advertising image based on your product, audience and selected style."}
                      </p>

                      {!generatingImage && (
                        <button
                          onClick={generateVisual}
                          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.02]"
                        >
                          <ImageIcon className="h-4 w-4" />
                          Generate Visual
                        </button>
                      )}

                    </div>
                  )}

                  {imageUrl && (
                    <div className="space-y-5">

                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                        <img
                          src={imageUrl}
                          alt="Generated advertising visual"
                          className="block h-auto w-full object-cover"
                        />

                      </div>

                      <div className="flex flex-wrap gap-3">

                        <button
                          onClick={downloadImage}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.01] sm:flex-none"
                        >
                          <Download className="h-4 w-4" />
                          Download Visual
                        </button>

                        <button
                          onClick={generateVisual}
                          disabled={generatingImage}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50 sm:flex-none"
                        >
                          {generatingImage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}

                          Regenerate
                        </button>

                      </div>

                    </div>
                  )}

                </div>

                {/* ================================================= */}
                {/* VISUAL STRATEGY */}
                {/* ================================================= */}

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/20 sm:p-8">

                  <div className="mb-6">

                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-600">
                      <Target className="h-4 w-4" />
                      Creative strategy
                    </div>

                    <h3 className="text-xl font-bold">
                      Why this visual works
                    </h3>

                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <StrategyCard
                      title="Concept"
                      text={
                        adResult.visual_concept
                          .concept
                      }
                    />

                    <StrategyCard
                      title="Composition"
                      text={
                        adResult.visual_concept
                          .composition
                      }
                    />

                    <StrategyCard
                      title="Style"
                      text={
                        adResult.visual_concept
                          .style
                      }
                    />

                    <StrategyCard
                      title="Lighting"
                      text={
                        adResult.visual_concept
                          .lighting
                      }
                    />

                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

      </section>

    </main>
  );
}


// =====================================================
// INPUT COMPONENT
// =====================================================

function Input({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10"
      />

    </div>
  );
}


// =====================================================
// TEXTAREA
// =====================================================

function Textarea({
  label,
  placeholder,
  value,
  onChange,
  }: {
  label: ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10"
      />

    </div>
  );
}


// =====================================================
// SELECT
// =====================================================

function Select({
  label,
  value,
  options,
  onChange,
  customValue,
  customPlaceholder,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  customValue?: string;
  customPlaceholder?: string;
}) {
  const isCustom = value === "Custom" || !options.includes(value);
  const selectedValue = isCustom ? "Custom" : value;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      <ShadcnSelect value={selectedValue} onValueChange={onChange}>
        <SelectTrigger className="w-full rounded-xl border-slate-200 bg-white text-sm text-slate-900 shadow-none focus:ring-purple-500/10">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
      {isCustom && customValue !== undefined && (
        <ShadcnInput
          value={customValue === "Custom" ? "" : customValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder={customPlaceholder}
          className="rounded-xl border-slate-200 bg-white text-sm text-slate-900 shadow-none focus-visible:ring-purple-500/10"
        />
      )}
    </div>
  );
}


// =====================================================
// COPY FIELD
// =====================================================

function CopyField({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">

      <div className="mb-2 flex items-center justify-between gap-3">

        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </div>

        <button
          onClick={onCopy}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-purple-600"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>

      </div>

      <p className="text-sm leading-7 text-slate-800">
        {value}
      </p>

    </div>
  );
}


// =====================================================
// STRATEGY CARD
// =====================================================

function StrategyCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">

      <div className="mb-2 text-sm font-bold text-slate-900">
        {title}
      </div>

      <p className="text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}


// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState() {
  return (
    <div className="flex min-h-[650px] items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-purple-50/30 to-fuchsia-50/20 p-8 shadow-xl shadow-slate-200/30">

      <div className="max-w-md text-center">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-500 shadow-xl shadow-purple-500/20">

          <Sparkles className="h-9 w-9 text-white" />

        </div>

        <h3 className="text-2xl font-bold text-slate-950">
          Your ad will appear here
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          Fill in your product information and let AI
          create your advertising copy and visual
          concept.
        </p>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">

          <MiniFeature
            icon={<MessageSquareText className="h-4 w-4" />}
            text="Ad copy"
          />

          <MiniFeature
            icon={<ImageIcon className="h-4 w-4" />}
            text="Visuals"
          />

          <MiniFeature
            icon={<Download className="h-4 w-4" />}
            text="Download"
          />

        </div>

      </div>

    </div>
  );
}


// =====================================================
// MINI FEATURE
// =====================================================

function MiniFeature({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 shadow-sm">

      <div className="text-purple-600">
        {icon}
      </div>

      {text}

    </div>
  );
}


// =====================================================
// LOADING STATE
// =====================================================

function LoadingState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[650px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/30">

      <div className="max-w-md text-center">

        <div className="relative mx-auto mb-7 h-20 w-20">

          <div className="absolute inset-0 animate-ping rounded-3xl bg-purple-400/20" />

          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-xl shadow-purple-500/25">

            <Loader2 className="h-9 w-9 animate-spin text-white" />

          </div>

        </div>

        <h3 className="text-2xl font-bold text-slate-950">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          {description}
        </p>

        <div className="mx-auto mt-7 h-1.5 max-w-xs overflow-hidden rounded-full bg-purple-100">

          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500" />

        </div>

      </div>

    </div>
  );
}

