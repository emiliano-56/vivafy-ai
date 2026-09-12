  import { NextResponse } from 'next/server'

const allowed = (value: unknown, max = 1600) =>
  typeof value === 'string'
    ? value.trim().slice(0, max)
    : ''

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const mode = body.mode === 'marketing' ? 'marketing' : body.mode === 'landing' ? 'landing' : 'prompt'

    const niche = allowed(body.niche, 160)
    const product = allowed(body.product, 1800)
    const landingName = allowed(body.name, 160)
    const landingPurpose = allowed(body.purpose, 1600)
    const sectionList = Array.isArray(body.sections)
      ? body.sections.filter((item: unknown) => typeof item === 'string').slice(0, 20).map((item: string) => item.trim().slice(0, 60))
      : []
    const landingSections = sectionList.length ? sectionList.length : Math.min(20, Math.max(1, Number(body.sections) || 1))
    const landingStyle = allowed(body.style, 80)
    const landingPalette = allowed(body.palette, 80)
    const landingGradient = allowed(body.gradient, 80)
    const landingPrimaryColor = /^#[0-9a-f]{6}$/i.test(allowed(body.primaryColor, 30)) ? allowed(body.primaryColor, 30) : '#5b5a98'
    const landingFaviconUrl = allowed(body.faviconUrl, 800)
    const landingAnimations = ['none', 'subtle', 'dynamic'].includes(body.animations) ? body.animations : 'subtle'
    const landingContact = {
      email: allowed(body.email, 180),
      whatsapp: allowed(body.whatsapp, 500).replace(/[^0-9]/g, ''),
      facebook: allowed(body.facebook, 500),
      instagram: allowed(body.instagram, 500),
      other: allowed(body.otherSocial, 500),
    }
    const uploadedImages = Array.isArray(body.uploadedImages)
      ? body.uploadedImages.filter((item: unknown) => item && typeof item === 'object').slice(0, 8).map((item: { url?: unknown; placement?: unknown }) => ({ url: allowed(item.url, 800), placement: allowed(item.placement, 80) })).filter((item: { url: string }) => item.url)
      : []
    const landingPrimaryCta = allowed(body.primaryCta, 80)
    const landingPrimaryCtaLink = allowed(body.primaryCtaLink, 500)
    const landingSecondaryCta = allowed(body.secondaryCta, 80)
    const landingSecondaryCtaLink = allowed(body.secondaryCtaLink, 500)
    const landingImages = body.images === 'yes'
    const landingImageBrief = uploadedImages.map((item: { url: string; placement: string }) => `${item.placement}: ${item.url}`).join(' | ') || 'none'
    const platform = allowed(body.platform, 100)
    const objective = allowed(body.objective, 120)
    const stage = allowed(body.stage, 140)
    const productAudience = allowed(body.audience, 300)
    const offer = allowed(body.offer, 400)

    const keywords = Array.isArray(body.keywords)
      ? body.keywords
          .filter((item: unknown) => typeof item === 'string')
          .slice(0, 12)
          .map((item: string) => item.trim().slice(0, 80))
      : []

    const promptType = allowed(body.promptType, 100)
    const tone = allowed(body.tone, 100)
    const audience = allowed(body.audience, 140)
    const format = allowed(body.format, 100)
    const context = allowed(body.context, 1600)

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (mode === 'prompt' && !niche) {
      return NextResponse.json(
        { error: 'A niche is required.' },
        { status: 400 }
      )
    }

    if (mode === 'landing' && !landingPurpose && !landingName) return NextResponse.json({ error: 'Add a landing page name or description.' }, { status: 400 })

    if (mode === 'marketing' && !product) {
      return NextResponse.json(
        { error: 'Add a product, store link, or keywords.' },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // DEEPSEEK API KEY
    // --------------------------------------------------
    // Direct key for now.
    // Later, you can add DEEPSEEK_API_KEY to .env.local.
    //
    // process.env.DEEPSEEK_API_KEY takes priority.
    // If it does not exist, the direct key is used.
    //
    // IMPORTANT:
    // Replace this with your NEW/ROTATED DeepSeek key.
    // Do not commit a real API key to GitHub.
    // --------------------------------------------------
 const apiKey = process.env.DEEPSEEK_API_KEY?.trim()

if (!apiKey) {
  return NextResponse.json(
    {
      error:
        'DeepSeek API key is missing. Add DEEPSEEK_API_KEY to your environment variables.',
    },
    { status: 500 }
  )
}

    // --------------------------------------------------
    // MARKETING PROMPT
    // --------------------------------------------------

    const landingPrompt = `Build the actual landing page now. Return ONLY valid JSON with exactly these string keys: html, css, js. html must contain the complete accessible landing page body markup with exactly ${landingSections} sections, in this order where possible: ${sectionList.join(', ') || 'a clear conversion-focused structure'}. css must contain every style needed for a premium responsive design using ${landingStyle || 'Tailwind CSS'} conventions. The output is rendered as a standalone HTML document without Tailwind or any external stylesheet, so css MUST be self-contained plain CSS with selectors matching the html classes, and html MUST NOT rely on Tailwind utility classes, CSS imports, or framework runtime. js must be lightweight browser JavaScript or an empty string. Treat every collected preference as a hard implementation requirement, not a suggestion. When WhatsApp is provided, build every WhatsApp CTA as https://wa.me/${landingContact.whatsapp} using digits only; use mailto: for email and target="_blank" with rel="noopener noreferrer" for social links. If a favicon URL is provided (${landingFaviconUrl || 'none'}), include it as a proper <link rel="icon" href="${landingFaviconUrl}"> in the generated document head; never place favicon or uploaded content images in the Navbar unless its placement is explicitly Navbar. Uploaded image placement instructions are authoritative: ${landingImageBrief}. If an image placement is not Navbar, render it only in its requested section inside a styled responsive media wrapper; if placement is Navbar, use it only as a compact, polished logo with constrained dimensions and object-fit: contain. Include generous responsive section padding (clamp-based where useful), a centered max-width container, refined typography with clear hierarchy, rich multi-paragraph text content, intentional whitespace, soft tinted borders that harmonize with the selected palette (${landingPalette || 'Lavender studio'}) and custom primary color ${landingPrimaryColor || '#5b5a98'} (never harsh neutral-gray 1px borders), layered shadows, refined card surfaces with generous radius, polished conversion-focused copy, responsive states, keyboard-friendly buttons, and a genuinely responsive mobile navigation with a compact menu toggle when a Navbar is selected, and ${landingImages ? 'real royalty-free image URLs plus useful alt text' : 'no images'}. Never render a raw unstyled image: every image must have a responsive width/height strategy, object-fit, rounded or editorial framing, accessible alt text, and a deliberate placement-specific wrapper with spacing. Never output raw unstyled section headings or bare text blocks: each requested section must have a polished layout, visual hierarchy, responsive padding, and mobile stacking behavior. Use the preferred palette ${landingPalette || 'Lavender studio'}, gradient treatment ${landingGradient || 'Soft glow'}, and brand color ${landingPrimaryColor || 'not specified'}. ${landingAnimations === 'none' ? 'Do not add animations.' : landingAnimations === 'dynamic' ? 'Add tasteful scroll reveal and hover animations with reduced-motion support.' : 'Add subtle entrance and hover animations with reduced-motion support.'} The primary CTA must be labeled "${landingPrimaryCta || 'Get started'}" and link to "${landingPrimaryCtaLink || '#'}". The secondary CTA must be labeled "${landingSecondaryCta || 'Learn more'}" and link to "${landingSecondaryCtaLink || '#'}". Contact destinations: ${JSON.stringify(landingContact)}. If an email is provided, use mailto:${landingContact.email}; social and WhatsApp links must open in a new tab with target="_blank" and rel="noopener noreferrer". Uploaded image assets and requested placements: ${JSON.stringify(uploadedImages)}. Use uploaded asset URLs exactly where requested and preserve useful alt text. Do not use markdown fences, explanations, or additional JSON keys. Landing name: ${landingName || 'Untitled landing page'}. Purpose and offer: ${landingPurpose || 'Not specified'}.`

    const marketingPrompt = `
Create a conversion-focused ${platform || 'Facebook/Instagram'} ad copy pack for a beginner advertiser.

Return clearly labeled sections:

1. 3 hook variations
2. 3 primary text variations
3. 5 headlines
4. 3 descriptions
5. 3 CTA suggestions
6. Creative direction for the image/video
7. A simple A/B testing plan
8. Explain why the strongest variation works

Keep claims grounded in the provided brief.
Write naturally and persuasively.
Do not invent product facts, guarantees, testimonials, discounts, or results.

Platform: ${platform || 'Facebook and Instagram'}
Campaign objective: ${objective || 'Not specified'}
Audience stage: ${stage || 'Not specified'}
Product/store link or keywords: ${product}
Target audience: ${
      productAudience ||
      'Infer a likely audience and clearly state the assumption.'
    }
Offer or proof: ${offer || 'None provided'}
`

    // --------------------------------------------------
    // NORMAL PROMPT MODE
    // --------------------------------------------------

    const promptInput =
      mode === 'landing'
        ? landingPrompt
        : mode === 'marketing'
          ? marketingPrompt
          : `
Create a ${format || 'general'} for this brief:

Niche: ${niche}

Keywords:
${keywords.join(', ') || 'none provided'}

Prompt type:
${promptType || 'general purpose'}

Tone:
${tone || 'clear and confident'}

Audience:
${audience || 'general audience'}

Extra context:
${context || 'none provided'}
`

    // --------------------------------------------------
    // SYSTEM PROMPT
    // --------------------------------------------------

    const systemPrompt =
      mode === 'landing'
        ? 'You are a senior landing page strategist and frontend architect. Produce practical, conversion-focused page content and implementation guidance. Use exactly the requested number of sections and never invent unsupported claims.'
        : mode === 'marketing'
          ? `
You are a senior direct-response advertising strategist and patient teacher.

Write practical, ethical ad copy for Facebook and Instagram.

Do not invent:
- Product facts
- Guarantees
- Testimonials
- Discounts
- Results
- Statistics
- Prohibited personal-attribute claims

Return only the requested copy pack.
`
        : `
You are an expert prompt engineer.

Write one polished, ready-to-copy prompt for another AI model.

The prompt must contain:
- Clear instructions
- Useful context
- Relevant constraints
- An ideal output structure

Return only the prompt itself.

Do not add commentary.
Do not write "Here is your prompt".
Do not add quotation marks around the prompt.
Do not explain what you did.
`

    // --------------------------------------------------
    // DEEPSEEK REQUEST
    // --------------------------------------------------

    const response = await fetch(
      'https://api.deepseek.com/chat/completions',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },

        body: JSON.stringify({
          // deepseek-chat was retired.
          // Use the current DeepSeek V4 model.
          model: 'deepseek-v4-flash',

          // Disable thinking so temperature works normally.
          thinking: {
            type: 'disabled',
          },

          temperature: 0.7,

          ...(mode === 'landing' ? { response_format: { type: 'json_object' } } : {}),

          max_tokens:
            mode === 'landing'
              ? 6000
              : mode === 'marketing'
                ? 1500
                : 900,

          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: promptInput,
            },
          ],
        }),
      }
    )

    // --------------------------------------------------
    // READ RESPONSE
    // --------------------------------------------------

    let data: any

    try {
      data = await response.json()
    } catch {
      console.error(
        'DeepSeek returned a non-JSON response.'
      )

      return NextResponse.json(
        {
          error:
            'DeepSeek returned an invalid response.',
        },
        { status: 502 }
      )
    }

    // --------------------------------------------------
    // HANDLE DEEPSEEK ERRORS
    // --------------------------------------------------

    if (!response.ok) {
      console.error('DeepSeek API error:', {
        status: response.status,
        data,
      })

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            data?.message ||
            `DeepSeek API request failed with status ${response.status}.`,
        },
        {
          status: response.status,
        }
      )
    }

    // --------------------------------------------------
    // EXTRACT GENERATED CONTENT
    // --------------------------------------------------

    const rawContent = data?.choices?.[0]?.message?.content
    const prompt = typeof rawContent === 'string'
      ? rawContent.trim()
      : Array.isArray(rawContent)
        ? rawContent
            .map((part: unknown) => typeof part === 'string' ? part : typeof part === 'object' && part !== null && 'text' in part ? String((part as { text?: unknown }).text ?? '') : '')
            .join('')
            .trim()
        : rawContent && typeof rawContent === 'object'
          ? JSON.stringify(rawContent)
          : ''

    if (!prompt) {
      console.error(
        'DeepSeek returned no content:',
        data
      )

      return NextResponse.json(
        {
          error:
            'DeepSeek returned an empty response.',
        },
        { status: 502 }
      )
    }

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    if (mode === 'landing') {
      try {
        const cleaned = prompt
          .replace(/^\uFEFF/, '')
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim()

        let landing: unknown
        try {
          landing = JSON.parse(cleaned)
        } catch {
          const start = cleaned.indexOf('{')
          if (start < 0) throw new Error('Missing JSON object')

          let depth = 0
          let inString = false
          let escaped = false
          let end = -1
          for (let index = start; index < cleaned.length; index += 1) {
            const character = cleaned[index]
            if (inString) {
              if (escaped) escaped = false
              else if (character === '\\\\') escaped = true
              else if (character === '"') inString = false
              continue
            }
            if (character === '"') inString = true
            else if (character === '{') depth += 1
            else if (character === '}' && --depth === 0) {
              end = index + 1
              break
            }
          }
          if (end < 0) throw new Error('Incomplete JSON object')
          landing = JSON.parse(cleaned.slice(start, end))
        }

        if (!landing || typeof landing !== 'object') throw new Error('Invalid landing payload')
        const page = landing as { html?: unknown; css?: unknown; js?: unknown }
        if (typeof page.html !== 'string' || !page.html.trim() || typeof page.css !== 'string') throw new Error('Invalid landing payload')
        return NextResponse.json({ prompt, landing: { html: page.html, css: page.css, js: typeof page.js === 'string' ? page.js : '' } })
      } catch (parseError) {
        console.error('Landing response parse error:', parseError)
        return NextResponse.json({ error: 'The designer returned invalid landing-page code. Please try again.' }, { status: 502 })
      }
    }

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error(
      'Prompt generation error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Invalid request or server error. Please try again.',
      },
      { status: 500 }
    )
  }
}
