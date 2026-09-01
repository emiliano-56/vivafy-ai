'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Check, Download, ExternalLink, ImagePlus, Maximize2, Monitor, Smartphone, Sparkles, Tablet, Upload, X } from 'lucide-react'
import { VivafyHeader, inputClass, panel, primaryButton } from '@/components/vivafy-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const steps = ['Brief', 'Structure', 'Style', 'Preview']
const sectionOptions = ['Navbar', 'Hero', 'Benefits', 'Features', 'Cards', 'Two columns', 'Three columns', 'Table', 'Pricing', 'FAQ', 'Testimonials', 'Social proof', 'About', 'How it works', 'Contact', 'CTA', 'Logo cloud', 'Process timeline', 'Comparison', 'Newsletter']
const palettes = ['Lavender studio', 'Coral editorial', 'Midnight contrast', 'Forest premium', 'Ocean clarity', 'Citrus energy', 'Rose minimal', 'Slate luxury', 'Meadow calm']
const gradients = ['None', 'Soft glow', 'Aurora', 'Sunset wash']
const placements = ['Navbar', 'Hero', 'About', 'Features', 'Testimonials', 'Contact', 'Footer']
const devices = [
  { key: 'mobile', label: 'Mobile', icon: Smartphone, width: 'w-full max-w-[390px]' },
  { key: 'tablet', label: 'Tablet', icon: Tablet, width: 'w-full max-w-[720px]' },
  { key: 'desktop', label: 'Desktop', icon: Monitor, width: 'w-full' },
] as const

type Device = (typeof devices)[number]['key']
type UploadedImage = { url: string; name: string; placement: string }
type Form = {
  name: string; purpose: string; selectedSections: string[]; style: string; images: string; palette: string; gradient: string; primaryColor: string
  primaryCta: string; primaryCtaLink: string; secondaryCta: string; secondaryCtaLink: string; animations: string; faviconUrl: string
  email: string; whatsapp: string; facebook: string; instagram: string; otherSocial: string
}
type Generated = { html: string; css: string; js: string }

const initialSections = ['Hero', 'Benefits', 'Features', 'Contact', 'CTA']
const initialForm: Form = {
  name: '', purpose: '', selectedSections: initialSections, style: 'Tailwind CSS', images: 'yes', palette: palettes[0], gradient: gradients[1], primaryColor: '#5b5a98',
  primaryCta: 'Get started', primaryCtaLink: '', secondaryCta: 'Learn more', secondaryCtaLink: '', animations: 'none', faviconUrl: '', email: '', whatsapp: '', facebook: '', instagram: '', otherSocial: '',
}

const normalizeAnchors = (html: string) => html.replace(/^\s*```(?:html)?\s*/i, '').replace(/\s*```\s*$/i, '').replace(/<a(?![^>]*target=)([^>]*)>/gi, (_match, attrs) => `<a${attrs} target="_blank" rel="noopener noreferrer">`)

export default function LandingsPage() {
  const [step, setStep] = useState(0)
  const [device, setDevice] = useState<Device>('desktop')
  const [form, setForm] = useState<Form>(initialForm)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [faviconName, setFaviconName] = useState('')
  const [generated, setGenerated] = useState<Generated | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [publishOpen, setPublishOpen] = useState(false)
  const [siteName, setSiteName] = useState('')
  const [netlifyToken, setNetlifyToken] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [publishedUrl, setPublishedUrl] = useState('')
  const update = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }))
  const toggleSection = (section: string) => setForm((current) => ({ ...current, selectedSections: current.selectedSections.includes(section) ? current.selectedSections.filter((item) => item !== section) : current.selectedSections.length < 20 ? [...current.selectedSections, section] : current.selectedSections }))

  const documentHtml = useMemo(() => {
    if (!generated) return ''

    let bodyContent = normalizeAnchors(generated.html).trim()
    bodyContent = bodyContent.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    if (/<html[\s>]/i.test(bodyContent)) {
      const bodyMatch = bodyContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch?.[1]) bodyContent = bodyMatch[1].trim()
    }

    const safeScript = (generated.js || '').replace(/<\/script>/gi, '<\\/script>')
    const favicon = form.faviconUrl ? `<link rel="icon" href="${form.faviconUrl}" type="image/png">` : ''

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${form.name || 'Landing page'}</title>
  ${favicon}
  <style>${generated.css || ''}</style>
</head>
<body>
  ${bodyContent}
  <script>${safeScript}</script>
</body>
</html>`
  }, [form.name, form.faviconUrl, generated])

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true); setUploadError('')
    const placement = window.prompt(`Where should “${file.name}” appear?\n${placements.join(', ')}`, 'Hero') || 'Hero'
    const data = new FormData(); data.append('file', file); data.append('placement', placement)
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: data }); const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload failed')
      setUploadedImages((current) => [...current, { url: result.url, name: file.name, placement: result.placement }])
    } catch (uploadException) { setUploadError(uploadException instanceof Error ? uploadException.message : 'Upload failed') } finally { setUploading(false); event.target.value = '' }
  }

  const uploadFavicon = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true); setUploadError('')
    const data = new FormData(); data.append('file', file); data.append('placement', 'Navbar')
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: data }); const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Favicon upload failed')
      update('faviconUrl', result.url); setFaviconName(file.name)
    } catch (uploadException) { setUploadError(uploadException instanceof Error ? uploadException.message : 'Favicon upload failed') } finally { setUploading(false); event.target.value = '' }
  }

  const generate = async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/prompts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'landing', ...form, images: uploadedImages.length ? uploadedImages : form.images, sections: form.selectedSections, uploadedImages }) })
      const responseText = await response.text(); let data: { error?: string; landing?: Generated; prompt?: string }; try { data = JSON.parse(responseText) } catch { throw new Error(response.ok ? 'The generator returned an invalid response. Please try again.' : `The generator request failed (${response.status}). Please try again.`) } if (!response.ok) throw new Error(data.error || 'Could not build the landing page.')
      let parsed = data.landing
      if (!parsed && data.prompt) { try { parsed = JSON.parse(data.prompt.replace(/```json|```/g, '').trim()) } catch { parsed = null } }
      if (!parsed?.html) throw new Error('The designer returned an invalid page. Please try again.')
      setGenerated({ html: parsed.html, css: parsed.css || '', js: parsed.js || '' }); setStep(3)
    } catch (generationError) { setError(generationError instanceof Error ? generationError.message : 'Could not build the landing page.') } finally { setLoading(false) }
  }

  const downloadPage = () => {
    if (!documentHtml) return
    const blob = new Blob([documentHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a')
    link.href = url; link.download = `${(form.name || 'landing-page').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url)
  }

  const openFullPreview = () => {
    if (!documentHtml) return
    const url = URL.createObjectURL(new Blob([documentHtml], { type: 'text/html' })); window.open(url, '_blank', 'noopener,noreferrer'); window.setTimeout(() => URL.revokeObjectURL(url), 60000)
  }
  const publishToNetlify = async () => {
    if (!documentHtml) {
      setPublishError('There is no generated landing page to publish.')
      return
    }
    if (!netlifyToken.trim()) {
      setPublishError('Please enter your Netlify Personal Access Token.')
      return
    }
    setPublishing(true)
    setPublishError('')
    setPublishedUrl('')
    try {
      const publishHtml = documentHtml.trim()
      if (!publishHtml.toLowerCase().includes('<!doctype html>') || !publishHtml.toLowerCase().includes('<html')) {
        throw new Error('The generated page is not a valid HTML document. Please regenerate the page.')
      }
      const response = await fetch('/api/netlify/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: netlifyToken.trim(), siteName: siteName.trim() || form.name.trim() || `landing-page-${Date.now()}`, files: [{ path: 'index.html', content: publishHtml }] }),
      })
      const responseText = await response.text()
      let result: { success?: boolean; error?: string; url?: string; site?: { url?: string; id?: string; deployId?: string; state?: string } }
      try { result = JSON.parse(responseText) } catch { throw new Error(`The publishing server returned an invalid response (${response.status}).`) }
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not publish your site.')
      const liveUrl = result.url || result.site?.url || ''
      if (!liveUrl) throw new Error('The site was deployed, but no live URL was returned.')
      setPublishedUrl(liveUrl)
      setNetlifyToken('')
    } catch (publishException) {
      setPublishError(publishException instanceof Error ? publishException.message : 'Could not publish your site.')
    } finally { setPublishing(false) }
  }

  const currentDevice = devices.find((item) => item.key === device) || devices[2]

  return <main className="min-h-screen bg-[#fbfbfe] text-[#252548]"><VivafyHeader /><div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-10 lg:pt-14">
    <div className="mb-10 max-w-3xl sm:mb-14"><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[#f26b43]">Landing builder</p><h1 className="text-balance text-4xl font-semibold tracking-[-.05em] sm:text-6xl">From blank page to launch-ready.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-[#77778b]">Shape the story, style, and conversion path. Vivafy AI turns your brief into a responsive landing page with rich content and polished interaction.</p></div>
    <div className="mb-8 flex flex-wrap items-center gap-y-3 sm:mb-10">{steps.map((label, index) => <div key={label} className="flex items-center gap-2"><div className={`flex size-9 items-center justify-center rounded-full text-xs font-bold shadow-sm ${index <= step ? 'bg-[linear-gradient(90deg,#8b2de2,#17d5da)] text-white' : 'bg-[#f0f0f7] text-[#9292a3]'}`}>{index < step ? <Check className="size-4" /> : index + 1}</div><span className={`text-sm font-semibold ${index === step ? 'text-[#252548]' : 'text-[#9292a3]'}`}>{label}</span>{index < steps.length - 1 && <div className="mx-2 h-px w-5 bg-[#e8e8f0] sm:w-12" />}</div>)}</div>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(340px,.78fr)_minmax(0,1.22fr)] xl:gap-8">
      <section className={`${panel} p-5 sm:p-8`}><div className="flex min-h-[560px] flex-col"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#5b5a98]">Step {step + 1} of 4</p>
        {step === 0 && <div className="mt-7 flex flex-col gap-6"><div><Label htmlFor="name">What should we call your landing page?</Label><Input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. The Focus Method" className={inputClass} /></div><div><Label htmlFor="purpose">What is it about?</Label><Textarea id="purpose" value={form.purpose} onChange={(e) => update('purpose', e.target.value)} placeholder="Describe the offer, audience, proof, and main promise..." className={`${inputClass} min-h-36`} /></div></div>}
        {step === 1 && <div className="mt-7"><div className="mb-4"><Label>Choose your sections</Label><p className="mt-1 text-sm leading-6 text-[#77778b]">Select as many as you need, up to 20 sections.</p></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{sectionOptions.map((section) => <button key={section} type="button" onClick={() => toggleSection(section)} aria-pressed={form.selectedSections.includes(section)} className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${form.selectedSections.includes(section) ? 'border-[#5b5a98] bg-[#eeedf8] text-[#5b5a98] shadow-sm' : 'border-[#ecebf2] bg-white text-[#77778b] hover:border-[#b9b7d5]'}`}><span className="mr-1.5">{form.selectedSections.includes(section) ? '✓' : '+'}</span>{section}</button>)}</div><p className="mt-4 text-xs font-semibold text-[#9292a3]">{form.selectedSections.length}/20 selected</p></div>}
        {step === 2 && <div className="mt-7 flex flex-col gap-6"><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="palette">Preferred palette</Label><Select value={form.palette} onValueChange={(value) => update('palette', value || palettes[0])}><SelectTrigger id="palette" className={inputClass}><SelectValue /></SelectTrigger><SelectContent>{palettes.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="primaryColor">Custom primary color</Label><div className="flex gap-2"><Input id="primaryColor" type="color" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="h-10 w-14 cursor-pointer p-1" aria-label="Choose primary color" /><Input value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} placeholder="#5b5a98" pattern="^#[0-9a-fA-F]{6}$" className={inputClass} aria-label="Primary color hex code" /></div></div><div><Label htmlFor="gradient">Gradient treatment</Label><Select value={form.gradient} onValueChange={(value) => update('gradient', value || gradients[0])}><SelectTrigger id="gradient" className={inputClass}><SelectValue /></SelectTrigger><SelectContent>{gradients.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div></div><div><Label htmlFor="animations">Animation preference</Label><Select value={form.animations} onValueChange={(value) => update('animations', value || 'none')}><SelectTrigger id="animations" className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No animations</SelectItem><SelectItem value="subtle">Subtle entrance animations</SelectItem><SelectItem value="dynamic">Rich scroll animations</SelectItem></SelectContent></Select></div><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="primaryCta">Primary CTA</Label><Input id="primaryCta" value={form.primaryCta} onChange={(e) => update('primaryCta', e.target.value)} className={inputClass} /></div><div><Label htmlFor="primaryCtaLink">Primary destination</Label><Input id="primaryCtaLink" type="url" value={form.primaryCtaLink} onChange={(e) => update('primaryCtaLink', e.target.value)} placeholder="https://..." className={inputClass} /></div><div><Label htmlFor="secondaryCta">Secondary CTA</Label><Input id="secondaryCta" value={form.secondaryCta} onChange={(e) => update('secondaryCta', e.target.value)} className={inputClass} /></div><div><Label htmlFor="secondaryCtaLink">Secondary destination</Label><Input id="secondaryCtaLink" type="url" value={form.secondaryCtaLink} onChange={(e) => update('secondaryCtaLink', e.target.value)} placeholder="https://..." className={inputClass} /></div></div><div className="rounded-2xl border border-[#ecebf2] bg-[#faf9fd] p-4"><div className="mb-4 flex items-center gap-2"><ImagePlus className="size-4 text-[#5b5a98]" /><div><p className="text-sm font-semibold">Optional premium images</p><p className="text-xs text-[#9292a3]">JPG, PNG, WebP, or AVIF up to 8MB.</p></div></div><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#b9b7d5] bg-white px-4 py-4 text-sm font-semibold text-[#5b5a98] hover:bg-[#f5f3fb]"><Upload className="size-4" />{uploading ? 'Uploading...' : 'Upload an image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={uploadImage} className="sr-only" /></label>{uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}{uploadedImages.length > 0 && <div className="mt-4 grid gap-3">{uploadedImages.map((image) => <div key={image.url} className="flex items-center gap-3 rounded-xl bg-white p-2 ring-1 ring-[#ecebf2]"><img src={image.url} alt={`${image.name} preview`} className="size-12 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{image.name}</p><p className="text-xs text-[#9292a3]">Placement: {image.placement}</p></div><button type="button" onClick={() => setUploadedImages((current) => current.filter((item) => item.url !== image.url))} aria-label={`Remove ${image.name}`} className="text-[#9292a3] hover:text-red-600"><X className="size-4" /></button></div>)}</div>}</div><div className="rounded-2xl border border-[#ecebf2] bg-[#faf9fd] p-4"><p className="mb-3 text-sm font-semibold">Contact and social destinations</p><div className="grid gap-3 sm:grid-cols-2"><Input aria-label="Contact email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="Email address" className={inputClass} /><Input aria-label="WhatsApp link" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="WhatsApp link" className={inputClass} /><Input aria-label="Facebook link" value={form.facebook} onChange={(e) => update('facebook', e.target.value)} placeholder="Facebook URL" className={inputClass} /><Input aria-label="Instagram link" value={form.instagram} onChange={(e) => update('instagram', e.target.value)} placeholder="Instagram URL" className={inputClass} /></div><Input aria-label="Other social link" value={form.otherSocial} onChange={(e) => update('otherSocial', e.target.value)} placeholder="Other social link (optional)" className={`${inputClass} mt-3`} /></div></div>}
        {step === 3 && <div className="mt-7"><div className="rounded-2xl bg-[#f6f5fa] p-5"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">Your page is ready</p><p className="mt-1 text-sm leading-6 text-[#77778b]">Preview each breakpoint or open a clean full-page version.</p></div><Sparkles className="size-5 shrink-0 text-[#f26b43]" /></div></div><div className="mt-4 rounded-2xl border border-[#ecebf2] p-4"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#9292a3]">Included sections</p><div className="mt-3 flex flex-wrap gap-2">{form.selectedSections.map((section) => <span key={section} className="rounded-full bg-[#f1f0f8] px-3 py-1.5 text-xs font-semibold text-[#5b5a98]">{section}</span>)}</div></div></div>}
        <div className="mt-6 rounded-2xl border border-[#e4e1f1] bg-[#faf9fd] p-4"><div className="flex items-center justify-between gap-3"><div><Label htmlFor="favicon-upload">Optional favicon logo</Label><p className="mt-1 text-xs leading-5 text-[#77778b]">Upload a PNG, ICO, SVG, or WebP icon for the generated page.</p></div><label htmlFor="favicon-upload" className="inline-flex h-10 cursor-pointer items-center rounded-xl bg-[#eeedf8] px-3 text-xs font-semibold text-[#5b5a98] transition hover:bg-[#e4e1f1]"><Upload className="mr-2 size-3.5" />{uploading ? 'Uploading...' : faviconName ? 'Replace' : 'Upload'}</label><input id="favicon-upload" type="file" accept="image/png,image/x-icon,image/svg+xml,image/webp" onChange={uploadFavicon} className="sr-only" /></div>{faviconName && <p className="mt-2 truncate text-xs text-[#77778b]">{faviconName}</p>}</div>
        {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
        <div className="mt-auto flex flex-wrap gap-3 pt-8">{step > 0 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="h-12 rounded-xl px-5">Back</Button>}{step < 2 ? <Button type="button" onClick={() => setStep(step + 1)} className={`${primaryButton} h-12 rounded-xl px-6`}>Continue <ArrowRight className="ml-2 size-4" /></Button> : step === 2 ? <Button type="button" disabled={loading} onClick={generate} className={`${primaryButton} h-12 rounded-xl px-6`}>{loading ? 'Designing...' : 'Generate page'} <Sparkles className="ml-2 size-4" /></Button> : <Button type="button" onClick={() => setStep(2)} variant="outline" className="h-12 rounded-xl px-5">Edit style</Button>}</div>
      </div></section>
      <section className={`${panel} min-w-0 overflow-hidden p-3 sm:p-5`}><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecebf2] px-2 pb-4 sm:px-3"><div><p className="text-sm font-semibold">Live preview</p><p className="mt-1 text-xs text-[#9292a3]">Responsive canvas</p></div><div className="flex flex-wrap items-center gap-2"><div className="flex rounded-xl bg-[#f4f3f8] p-1" role="tablist" aria-label="Preview device">{devices.map((item) => { const Icon = item.icon; return <button key={item.key} type="button" role="tab" aria-selected={device === item.key} onClick={() => setDevice(item.key)} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition sm:px-3 ${device === item.key ? 'bg-white text-[#5b5a98] shadow-sm' : 'text-[#9292a3] hover:text-[#5b5a98]'}`}><Icon className="size-3.5" /><span className="hidden sm:inline">{item.label}</span></button> })}</div>{generated && <><Button type="button" onClick={downloadPage} variant="outline" className="h-10 rounded-xl px-3 text-xs font-semibold"><Download className="mr-2 size-3.5" />Download HTML</Button><Button type="button" onClick={() => { setPublishOpen(true); setPublishError(''); setPublishedUrl('') }} className={`${primaryButton} h-10 rounded-xl px-3 text-xs font-semibold`}><ExternalLink className="mr-2 size-3.5" />Publish</Button><Button type="button" onClick={openFullPreview} variant="outline" className="h-10 rounded-xl px-3 text-xs font-semibold"><Maximize2 className="mr-2 size-3.5" />Full preview <ExternalLink className="ml-2 size-3.5" /></Button></>}</div></div><div className="flex min-h-[620px] items-start justify-center overflow-auto bg-[#f8f7fb] p-3 pt-5 sm:p-6 sm:pt-8">{generated ? <div className={`${currentDevice.width} overflow-hidden rounded-xl bg-white shadow-[0_18px_60px_rgba(37,37,72,.12)] ring-1 ring-black/5 transition-all`}><iframe title={`${form.name || 'Landing page'} ${device} preview`} srcDoc={documentHtml} className="block h-[680px] w-full border-0 sm:h-[760px]" sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox" /></div> : <div className="flex min-h-[500px] max-w-sm flex-col items-center justify-center px-6 text-center"><div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-[#eeedf8] text-[#5b5a98]"><Sparkles className="size-6" /></div><p className="font-semibold">Your page will appear here</p><p className="mt-2 text-sm leading-6 text-[#9292a3]">Choose your sections and style, then generate a premium responsive landing page.</p></div>}</div></section>
    </div></div>{publishOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="publish-title"><div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 id="publish-title" className="text-xl font-semibold">Publish to Netlify</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Enter your site name and Netlify personal access token.</p></div><button type="button" onClick={() => setPublishOpen(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Close publish dialog"><X className="size-4" /></button></div><div className="mt-6 flex flex-col gap-4"><div><Label htmlFor="site-name">Site name</Label><Input id="site-name" value={siteName} onChange={(event) => setSiteName(event.target.value)} placeholder="my-vivafy-site" className={inputClass} /></div><div><Label htmlFor="netlify-token">Netlify personal access token</Label><Input id="netlify-token" type="password" value={netlifyToken} onChange={(event) => setNetlifyToken(event.target.value)} placeholder="Paste your token" autoComplete="off" className={inputClass} /></div>{publishError && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive" role="alert">{publishError}</p>}{publishedUrl && <div className="rounded-xl bg-secondary p-3 text-sm"><p className="font-semibold text-primary">Published successfully</p><a href={publishedUrl} target="_blank" rel="noreferrer" className="mt-1 block truncate text-primary underline">{publishedUrl}</a></div>}<Button type="button" disabled={publishing || !netlifyToken.trim()} onClick={publishToNetlify} className={`${primaryButton} h-11 rounded-xl font-semibold`}>{publishing ? 'Publishing...' : 'Publish site'}</Button>    </div></div></div>}
  </main>
}
