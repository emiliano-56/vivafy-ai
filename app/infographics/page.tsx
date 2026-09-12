"use client";

import { useState, type ReactNode } from "react";
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
  RefreshCw,
  ArrowRight,
  Loader2,
  FileText,
  LayoutDashboard,
  Palette,
  Type,
  Layers,
  Lightbulb,
} from "lucide-react";

const API_BASE_URL =
   "https://zoop-a1-v2.onrender.com/infographics";

type Section = {
  section_number: number;
  heading: string;
  short_text: string;
  key_point: string;
  visual_element: string;
};

type InfographicResult = {
  title: string;
  subtitle: string;
  introduction: string;
  sections: Section[];
  conclusion: string;
  source_note: string;

  visual_direction: {
    layout: string;
    color_palette: string;
    typography: string;
    icon_style: string;
    illustration_style: string;
  };

  image_prompt: string;
};

export default function Home() {

  const [form, setForm] = useState({
    topic: "",
    description: "",
    audience: "",
    niche: "",
    infographic_type: "Educational",
    tone: "Clear and informative",
    visual_style: "Modern",
    aspect_ratio: "4:5",
  });

  const [result, setResult] =
    useState<InfographicResult | null>(null);

  const [imageUrl, setImageUrl] =
    useState("");

  const [generatingContent, setGeneratingContent] =
    useState(false);

  const [generatingImage, setGeneratingImage] =
    useState(false);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState("");

  // =====================================================
  // UPDATE FORM
  // =====================================================

  const updateForm = (
    field: keyof typeof form,
    value: string
  ) => {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

  };

  // =====================================================
  // GENERATE INFOGRAPHIC CONTENT
  // =====================================================

  const generateInfographic = async () => {

    setError("");
    setResult(null);
    setImageUrl("");

    if (
      !form.topic.trim() ||
      !form.description.trim() ||
      !form.audience.trim() ||
      !form.niche.trim()
    ) {

      setError(
        "Please fill in the topic, description, audience and niche."
      );

      return;
    }

    try {

      setGeneratingContent(true);

      const response = await fetch(
        `${API_BASE_URL}/generate-infographic`,
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
          data?.detail ||
          "Failed to generate infographic."
        );

      }

      if (
        !data.success ||
        !data.infographic
      ) {

        throw new Error(
          "Invalid response from backend."
        );

      }

      setResult(data.infographic);

    } catch (err: any) {

      setError(
        err?.message ||
        "Something went wrong."
      );

    } finally {

      setGeneratingContent(false);

    }

  };

  // =====================================================
  // GENERATE IMAGE
  // =====================================================

  const generateVisual = async () => {

    if (!result?.image_prompt) {
      return;
    }

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
            prompt: result.image_prompt,
            aspect_ratio: form.aspect_ratio,
            output_format: "png",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Failed to generate infographic."
        );

      }

      if (
        !data.success ||
        !data.image_url
      ) {

        throw new Error(
          "No infographic image was returned."
        );

      }

      setImageUrl(data.image_url);

    } catch (err: any) {

      setError(
        err?.message ||
        "Something went wrong while creating the infographic."
      );

    } finally {

      setGeneratingImage(false);

    }

  };

  // =====================================================
  // COPY ALL CONTENT
  // =====================================================

  const copyAll = async () => {

    if (!result) {
      return;
    }

    const text = `
${result.title}

${result.subtitle}

${result.introduction}

${result.sections
  .map(
    (section) =>
      `${section.section_number}. ${section.heading}
${section.short_text}
Key point: ${section.key_point}`
  )
  .join("\n\n")}

${result.conclusion}
`;

    try {

      await navigator.clipboard.writeText(
        text.trim()
      );

      setCopied("all");

      setTimeout(() => {
        setCopied("");
      }, 1800);

    } catch {

      setError(
        "Unable to copy content."
      );

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

      await navigator.clipboard.writeText(
        text
      );

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 1800);

    } catch {

      setError(
        "Unable to copy text."
      );

    }

  };

  // =====================================================
  // DOWNLOAD
  // =====================================================

  const downloadImage = () => {

    if (!imageUrl) {
      return;
    }

    const downloadUrl =
      `${API_BASE_URL}/download-image?image_url=` +
      encodeURIComponent(imageUrl);

    window.open(
      downloadUrl,
      "_blank"
    );

  };

  return (

    <main className="min-h-screen bg-white text-slate-900">

      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -top-52 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-purple-300/20 blur-[130px]" />

        <div className="absolute right-[-200px] top-[35%] h-[500px] w-[500px] rounded-full bg-fuchsia-300/10 blur-[130px]" />

        <div className="absolute bottom-[-200px] left-[-150px] h-[500px] w-[500px] rounded-full bg-violet-300/10 blur-[130px]" />

      </div>


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <VivafyHeader />


      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="relative z-10 px-6 pb-12 pt-14 lg:px-8">

        <div className="mx-auto max-w-4xl text-center">

          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700">

            <LayoutDashboard className="h-4 w-4" />

            From idea to infographic

          </div>

          <h2 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">

            Turn complex information into

            <span className="block bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">

              beautiful infographics.

            </span>

          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">

            Enter a topic and let AI organize the information,
            create the visual structure, and generate a
            professional infographic you can download.

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

                <FileText className="h-5 w-5 text-white" />

              </div>

              <h3 className="text-xl font-bold">
                Create infographic
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">

                Tell the AI what information you want
                to turn into a visual infographic.

              </p>

            </div>


            <div className="space-y-5">

              {/* Topic */}

              <Input
                label="Topic"
                placeholder="e.g. Benefits of drinking water"
                value={form.topic}
                onChange={(value) =>
                  updateForm(
                    "topic",
                    value
                  )
                }
              />


              {/* Description */}

              <Textarea
                label={<span className="inline-flex items-center gap-2"><span>What should the infographic explain?</span><span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500"><img src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/shopify/default.svg" alt="Shopify" className="size-3.5" /><img src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/amazon/default.svg" alt="Amazon" className="size-3.5" /><span>Store links</span></span></span>}
                placeholder="Describe the information you want included, or paste store link or open sites links"
                value={form.description}
                onChange={(value) =>
                  updateForm(
                    "description",
                    value
                  )
                }
              />


              {/* Audience */}

              <Select
                label="Target audience"
                value={form.audience}
                options={["Students", "Parents", "Entrepreneurs", "Content creators", "Small business owners", "Marketing professionals", "Teachers and educators", "Health and wellness audiences", "Online shoppers", "Custom"]}
                onChange={(value) => updateForm("audience", value)}
                customPlaceholder="Enter a custom audience"
              />


              {/* Niche */}

              <Select
                label="Niche or category"
                value={form.niche}
                options={["Health", "Education", "Business", "Technology", "Finance", "Marketing", "Lifestyle", "Science", "Travel", "Custom"]}
                onChange={(value) => updateForm("niche", value)}
                customPlaceholder="Enter a custom niche or category"
              />


              {/* Infographic type */}

              <Select
                label="Infographic type"
                value={
                  form.infographic_type
                }
                options={[
                  "Educational",
                  "How-to / Steps",
                  "Timeline",
                  "Comparison",
                  "List",
                  "Process",
                  "Statistics",
                  "Tips",
                  "Facts",
                ]}
                onChange={(value) =>
                  updateForm(
                    "infographic_type",
                    value
                  )
                }
              />


              {/* Tone */}

              <Select
                label="Content tone"
                value={form.tone}
                options={[
                  "Clear and informative",
                  "Simple and friendly",
                  "Professional",
                  "Academic",
                  "Fun and engaging",
                  "Bold",
                ]}
                onChange={(value) =>
                  updateForm(
                    "tone",
                    value
                  )
                }
              />


              {/* Visual style */}

              <Select
                label="Visual style"
                value={
                  form.visual_style
                }
                options={[
                  "Modern",
                  "Minimal",
                  "Professional",
                  "Editorial",
                  "Flat design",
                  "Isometric",
                  "Hand drawn",
                  "3D",
                  "Colorful",
                ]}
                onChange={(value) =>
                  updateForm(
                    "visual_style",
                    value
                  )
                }
              />


              {/* Aspect ratio */}

              <Select
                label="Format"
                value={
                  form.aspect_ratio
                }
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
                  updateForm(
                    "aspect_ratio",
                    value
                  )
                }
              />


              {/* Error */}

              {error && (

                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-600">

                  {error}

                </div>

              )}


              {/* Generate */}

              <button
                onClick={
                  generateInfographic
                }
                disabled={
                  generatingContent
                }
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition hover:scale-[1.01] hover:shadow-purple-500/35 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {generatingContent ? (

                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Creating infographic plan...

                  </>

                ) : (

                  <>
                    <Sparkles className="h-4 w-4" />

                    Generate Infographic

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

            {!result &&
              !generatingContent && (
                <EmptyState />
              )}


            {generatingContent && (

              <LoadingState
                title="Creating your infographic"
                description="Organizing your topic into a clear visual structure..."
              />

            )}


            {result &&
              !generatingContent && (

                <div className="space-y-6">


                  {/* ================================================= */}
                  {/* CONTENT */}
                  {/* ================================================= */}

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/30 sm:p-8">

                    <div className="mb-7 flex items-start justify-between gap-4">

                      <div>

                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-600">

                          <FileText className="h-4 w-4" />

                          Infographic content

                        </div>

                        <h3 className="text-2xl font-bold text-slate-950">

                          {result.title}

                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">

                          {result.subtitle}

                        </p>

                      </div>


                      <button
                        onClick={copyAll}
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


                    {/* Introduction */}

                    <div className="mb-6 rounded-2xl bg-gradient-to-r from-purple-50 to-fuchsia-50 p-5">

                      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-purple-600">

                        Introduction

                      </div>

                      <p className="text-sm leading-7 text-slate-700">

                        {result.introduction}

                      </p>

                    </div>


                    {/* Sections */}

                    <div className="space-y-4">

                      {result.sections.map(
                        (section) => (

                          <div
                            key={
                              section.section_number
                            }
                            className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
                          >

                            <div className="flex gap-4">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 text-sm font-bold text-white">

                                {
                                  section.section_number
                                }

                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-3">

                                  <h4 className="font-bold text-slate-900">

                                    {
                                      section.heading
                                    }

                                  </h4>

                                  <button
                                    onClick={() =>
                                      copyText(
                                        `${section.heading}\n${section.short_text}\n${section.key_point}`,
                                        `section-${section.section_number}`
                                      )
                                    }
                                    className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-purple-600"
                                  >

                                    {copied ===
                                    `section-${section.section_number}` ? (
                                      <Check className="h-4 w-4" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}

                                  </button>

                                </div>

                                <p className="mt-2 text-sm leading-6 text-slate-600">

                                  {
                                    section.short_text
                                  }

                                </p>

                                <div className="mt-3 rounded-xl bg-white p-3">

                                  <div className="text-xs font-bold uppercase tracking-wider text-purple-600">

                                    Key point

                                  </div>

                                  <p className="mt-1 text-sm font-medium text-slate-800">

                                    {
                                      section.key_point
                                    }

                                  </p>

                                </div>

                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">

                                  <Lightbulb className="h-3.5 w-3.5 text-purple-500" />

                                  Visual: {
                                    section.visual_element
                                  }

                                </div>

                              </div>

                            </div>

                          </div>

                        )
                      )}

                    </div>


                    {/* Conclusion */}

                    {result.conclusion && (

                      <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/50 p-5">

                        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-purple-600">

                          Takeaway

                        </div>

                        <p className="text-sm leading-7 text-slate-700">

                          {result.conclusion}

                        </p>

                      </div>

                    )}

                  </div>


                  {/* ================================================= */}
                  {/* VISUAL */}
                  {/* ================================================= */}

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/30 sm:p-8">

                    <div className="mb-6">

                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-600">

                        <ImageIcon className="h-4 w-4" />

                        Generated infographic

                      </div>

                      <h3 className="text-2xl font-bold">

                        Turn the content into a visual

                      </h3>

                      <p className="mt-1 text-sm text-slate-500">

                        Generate the final infographic from
                        the content and visual structure.

                      </p>

                    </div>


                    {!imageUrl && (

                      <div className="rounded-2xl border border-dashed border-purple-200 bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/50 p-10 text-center">

                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-lg shadow-purple-500/20">

                          {generatingImage ? (

                            <Loader2 className="h-7 w-7 animate-spin text-white" />

                          ) : (

                            <ImageIcon className="h-7 w-7 text-white" />

                          )}

                        </div>


                        <h4 className="text-lg font-bold">

                          {generatingImage
                            ? "Generating infographic..."
                            : "Ready to create the visual"}

                        </h4>


                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">

                          {generatingImage
                            ? "The AI is designing your infographic. This can take a little while."
                            : "Create a polished visual infographic from the generated content."}

                        </p>


                        {!generatingImage && (

                          <button
                            onClick={
                              generateVisual
                            }
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
                            alt="Generated infographic"
                            className="block h-auto w-full object-contain"
                          />

                        </div>


                        <div className="flex flex-wrap gap-3">

                          <button
                            onClick={
                              downloadImage
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.01] sm:flex-none"
                          >

                            <Download className="h-4 w-4" />

                            Download Infographic

                          </button>


                          <button
                            onClick={
                              generateVisual
                            }
                            disabled={
                              generatingImage
                            }
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
                  {/* DESIGN DIRECTION */}
                  {/* ================================================= */}

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/20 sm:p-8">

                    <div className="mb-6">

                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-600">

                        <Palette className="h-4 w-4" />

                        Visual direction

                      </div>

                      <h3 className="text-xl font-bold">

                        Infographic design system

                      </h3>

                    </div>


                    <div className="grid gap-4 sm:grid-cols-2">

                      <DirectionCard
                        icon={
                          <Layers className="h-4 w-4" />
                        }
                        title="Layout"
                        text={
                          result.visual_direction
                            .layout
                        }
                      />

                      <DirectionCard
                        icon={
                          <Palette className="h-4 w-4" />
                        }
                        title="Color palette"
                        text={
                          result.visual_direction
                            .color_palette
                        }
                      />

                      <DirectionCard
                        icon={
                          <Type className="h-4 w-4" />
                        }
                        title="Typography"
                        text={
                          result.visual_direction
                            .typography
                        }
                      />

                      <DirectionCard
                        icon={
                          <ImageIcon className="h-4 w-4" />
                        }
                        title="Icon & illustration"
                        text={
                          `${result.visual_direction.icon_style}. ${result.visual_direction.illustration_style}`
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
// INPUT
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
        onChange={(e) =>
          onChange(e.target.value)
        }
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
        onChange={(e) =>
          onChange(e.target.value)
        }
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
  customPlaceholder,
}: {
  label: ReactNode;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  customPlaceholder?: string;
}) {
  const isCustom = value === "Custom" || !options.includes(value);
  const selectedValue = isCustom ? "Custom" : value;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      <ShadcnSelect value={selectedValue} onValueChange={(nextValue) => nextValue && onChange(nextValue)}>
        <SelectTrigger className="w-full rounded-xl border-slate-200 bg-white text-sm text-slate-900 shadow-none focus:ring-purple-500/10">
          <SelectValue placeholder={`Select ${typeof label === "string" ? label.toLowerCase() : "an option"}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
      {isCustom && (
        <input
          value={value === "Custom" ? "" : value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={customPlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10"
        />
      )}
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

          Your infographic will appear here

        </h3>


        <p className="mt-3 text-sm leading-7 text-slate-500">

          Enter a topic and describe the information
          you want to communicate. AI will structure
          the content and create your visual.

        </p>


        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">

          <MiniFeature
            icon={
              <FileText className="h-4 w-4" />
            }
            text="Structure"
          />

          <MiniFeature
            icon={
              <ImageIcon className="h-4 w-4" />
            }
            text="Visualize"
          />

          <MiniFeature
            icon={
              <Download className="h-4 w-4" />
            }
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
// LOADING
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


// =====================================================
// DIRECTION CARD
// =====================================================

function DirectionCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">

      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">

        <span className="text-purple-600">

          {icon}

        </span>

        {title}

      </div>


      <p className="text-sm leading-6 text-slate-500">

        {text}

      </p>

    </div>

  );
}

