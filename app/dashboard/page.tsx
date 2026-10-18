'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  CircleHelp,
  CircleDollarSign,
  FileImage,
  Globe2,
  ImageIcon,
  LayoutDashboard,
  LineChart,
  Library,
  MessageSquare,
  Bot,
  MoreHorizontal,
  Plus,
  Sparkles,
  Coins,
  BookOpen,
  Clapperboard,
  Video,
  WandSparkles,
  Megaphone,
  Palette,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { supabase } from '@/lib/supabase'

const revenue = [
  { month: 'Jan', revenue: 18200 },
  { month: 'Feb', revenue: 24600 },
  { month: 'Mar', revenue: 22400 },
  { month: 'Apr', revenue: 30200 },
  { month: 'May', revenue: 35800 },
  { month: 'Jun', revenue: 42100 },
  { month: 'Jul', revenue: 47600 },
  { month: 'Aug', revenue: 54200 },
]

const orders = [
  { day: 'Mon', orders: 18 },
  { day: 'Tue', orders: 32 },
  { day: 'Wed', orders: 27 },
  { day: 'Thu', orders: 45 },
  { day: 'Fri', orders: 39 },
  { day: 'Sat', orders: 58 },
  { day: 'Sun', orders: 51 },
]

type NavItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
  count?: 'library' | 'video-count'
}

type NavGroup = {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Library', href: '/library', icon: Library, count: 'library' },
      { label: 'Prompt studio', href: '/prompt-studio', icon: WandSparkles },
      { label: 'Story', href: '/story', icon: Clapperboard },
      { label: 'Marketing', href: '/marketing', icon: Megaphone },
    ],
  },
  {
    title: 'Generate',
    items: [
      { label: 'Comic generator', href: '/comic', icon: FileImage },
      { label: 'Video generator', href: '/text-video', icon: Video, count: 'video-count' },
      { label: 'Image generator', href: '/text-image', icon: ImageIcon },
      { label: 'Coloring book', href: '/coloring', icon: Palette },
      { label: 'Chat image', href: '/chat-image', icon: MessageSquare },
    ],
  },
  {
    title: 'Studio',
    items: [
      { label: 'AI avatar', href: '/avatar', icon: Bot },
      { label: 'Cover designs', href: '/cover', icon: BookOpen },
      { label: 'Agentic', href: '/agentic', icon: Bot },
      { label: 'Landing page builder', href: '/landings', icon: LayoutDashboard },
    ],
  },
]

const planFeatures: Record<string, string[]> = {
  frontend: ['Overview', 'Library', 'Prompt studio', 'Story', 'Marketing'],
  platinum: ['Overview', 'Library', 'Prompt studio', 'Story', 'Marketing', 'Comic generator', 'Video generator', 'Image generator'],
  agentic: ['Overview', 'Library', 'Prompt studio', 'Story', 'Marketing', 'Comic generator', 'Video generator', 'Image generator', 'Coloring book', 'Chat image'],
  studio: ['Overview', 'Library', 'Prompt studio', 'Story', 'Marketing', 'Comic generator', 'Video generator', 'Image generator', 'Coloring book', 'Chat image', 'AI avatar', 'Cover designs', 'Agentic', 'Landing page builder'],
  reseller: ['Overview', 'Library', 'Prompt studio', 'Reseller'],
  whitelabel: ['Overview', 'Library', 'Prompt studio', 'White labels'],
}

const planOrder = ['frontend', 'platinum', 'agentic', 'studio', 'reseller', 'whitelabel']
const upgradeLinks = {
  frontend: 'https://vip.launchspecial.net/vivafyai/otos/platinum',
  platinum: 'https://vip.launchspecial.net/vivafyai/otos/agentic',
  agentic: 'https://vip.launchspecial.net/vivafyai/otos/studio',
  studio: 'https://vip.launchspecial.net/vivafyai/otos/reseller',
  reseller: 'https://vip.launchspecial.net/vivafyai/otos/whitelabel',
} as const

function getPlanKey(packageName: string | null) {
  const normalized = (packageName ?? '').toLowerCase().replace(/[^a-z]/g, '')
  if (normalized.includes('whitelabel')) return 'whitelabel'
  if (normalized.includes('reseller')) return 'reseller'
  if (normalized.includes('studio')) return 'studio'
  if (normalized.includes('agentic')) return 'agentic'
  if (normalized.includes('platinum')) return 'platinum'
  return 'frontend'
}

const chartConfig = {
  images: { label: 'Image generations', color: '#c92aa8' },
  videos: { label: 'Video generations', color: '#7435df' },
  }

export default function Page() {
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const [profile, setProfile] = useState<{
    first_name: string | null
    credits: number | null
    package: string | null
  } | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [activeMetric, setActiveMetric] = useState<string | null>(null)
  const [mediaCounts, setMediaCounts] = useState({ library: 0, images: 0, videos: 0 })
  const [videoRenderCount, setVideoRenderCount] = useState(0)
  const [mediaActivity, setMediaActivity] = useState({
    images: revenue.map(({ month }) => ({ month, images: 0 })),
    videos: revenue.map(({ month }) => ({ month, videos: 0 })),
  })

  useEffect(() => {
    let active = true

    const loadMediaCounts = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) return

      const [{ data: imageRows }, videoResult] = await Promise.all([
        supabase
          .from('images')
          .select('url, created_at')
          .eq('user_id', authData.user.id),
        supabase.storage.from('videos').list(authData.user.id, {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'created_at', order: 'asc' },
        }),
      ])

      if (!active) return
      const images = imageRows ?? []
      const videos = (videoResult.data ?? []).filter((file) => !file.name.startsWith('.'))
      if (videoResult.error) {
        console.error('[v0] Failed to load dashboard videos:', videoResult.error)
      }
      const videoCount = videos.length
      setVideoRenderCount(videoCount)
      setMediaCounts({ library: images.length + videoCount, images: images.length, videos: videoCount })

      const imageActivity = revenue.map(({ month }) => ({ month, images: 0 }))
      const videoActivity = revenue.map(({ month }) => ({ month, videos: 0 }))
      images.forEach((item: { created_at?: string | null }) => {
        const month = item.created_at ? new Date(item.created_at).toLocaleString('en-US', { month: 'short' }) : null
        const point = imageActivity.find((entry) => entry.month === month)
        if (point) point.images += 1
      })
      videos.forEach((file) => {
        const month = file.created_at ? new Date(file.created_at).toLocaleString('en-US', { month: 'short' }) : null
        const point = videoActivity.find((entry) => entry.month === month)
        if (point) point.videos += 1
      })
      setMediaActivity({ images: imageActivity, videos: videoActivity })
    }

    loadMediaCounts()
    const refresh = window.setInterval(loadMediaCounts, 15000)
    return () => {
      active = false
      window.clearInterval(refresh)
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (active) {
          setUserEmail('')
          setProfile(null)
        }
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('first_name, credits, package')
        .eq('id', user.id)
        .maybeSingle()

      if (active) {
        setUserEmail(user.email ?? '')
        setProfile(data)
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [router])

  const firstName = profile?.first_name || 'there'
  const credits = profile?.credits ?? 0
  const packageName = profile?.package || 'Vivafy AI-Front End'
  const planKey = getPlanKey(profile?.package ?? null)
  const enabledFeatures = planFeatures[planKey]
  const visibleNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => enabledFeatures.includes(item.label)),
    }))
    .filter((group) => group.items.length > 0)
  const manageItems: NavItem[] = [
    ...(enabledFeatures.includes('Reseller')
      ? [{ label: 'Reseller', href: '/reseller', icon: CircleDollarSign }]
      : []),
    ...(enabledFeatures.includes('White labels')
      ? [{ label: 'White labels', href: '/white', icon: Globe2 }]
      : []),
  ]
  const nextPlanKey = planOrder[planOrder.indexOf(planKey) + 1] as keyof typeof upgradeLinks | undefined
  const upgradeHref = nextPlanKey ? upgradeLinks[nextPlanKey] : undefined
  const hour = new Date().getHours()
  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 18
        ? 'Good afternoon'
        : 'Good evening'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  return (
    <main className="min-h-screen bg-[#ffffff] text-[#15165c]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-[linear-gradient(180deg,#0b0732_0%,#171052_52%,#24145e_100%)] px-5 py-6 text-[#ffffff] lg:flex">
          <div className="flex items-center px-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dash-logo-v62Et9Zp5phXHx7TE9TCW3VTLyjsGc.png"
              alt="Vivafy AI"
              className="h-12 w-full max-w-[190px] object-contain object-left"
            />
          </div>

          <div className="mt-10 flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
            {visibleNavGroups.map((group) => (
              <div key={group.title}>
                <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ffffff80]">
                  {group.title}
                </p>

                <nav
                  className="flex flex-col gap-1"
                  aria-label={`${group.title} navigation`}
                >
                  {group.items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors ${
                        item.href === '/dashboard'
                          ? 'bg-[linear-gradient(90deg,#4031d8,#7131d7,#08afc7)] text-[#ffffff] shadow-[0_8px_20px_rgba(24,20,112,0.35)]'
                          : 'text-[#ffffffcc] hover:bg-[#ffffff14] hover:text-[#ffffff]'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <item.icon className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>

                      {item.count && (
                        <span className="ml-2 shrink-0 rounded-full bg-[#ffffff1f] px-2 py-0.5 text-[9px] font-semibold tracking-wide text-[#ffffffcc]">
                          {item.count === 'library' ? mediaCounts.library : item.count === 'video-count' ? mediaCounts.videos : item.count}
                        </span>
                      )}
                    </a>
                  ))}
                </nav>
              </div>
            ))}

            <div>
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ffffff80]">
                Manage
              </p>

              <nav className="flex flex-col gap-1">
                {manageItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#ffffffcc] hover:bg-[#ffffff14] hover:text-[#ffffff]"
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {upgradeHref && (
            <div className="rounded-xl bg-[#ffffff14] p-4 text-[#ffffff]">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium">
                <CircleDollarSign className="size-4" />
                Upgrade
              </div>

              <p className="text-xs leading-5 text-[#ffffffb3]">
                Unlock more Vivafy AI features with the next plan.
              </p>

              <a
                href={upgradeHref}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex h-auto items-center p-0 text-xs text-[#ffffff] underline-offset-4 hover:underline"
              >
                View upgrade options
                <ArrowUpRight className="ml-1 size-3" />
              </a>
            </div>
          )}
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground text-primary lg:hidden">
                <Sparkles className="size-4" />
              </div>

              <div>
<p suppressHydrationWarning className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>

                <h1 className="font-serif text-xl font-semibold tracking-tight">
                  {greeting}, {firstName}
                </h1>

                <p className="text-xs text-muted-foreground">
                  {packageName} plan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/credits')}
                className="hidden h-9 gap-2 px-3 text-primary hover:bg-secondary sm:flex"
              >
                <Coins className="size-4" />
                <span className="text-xs font-semibold">
                  {credits.toLocaleString()} credits
                </span>
                <Plus className="size-3.5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="relative size-9"
              >
                <Bell className="size-4" />
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive" />
                <span className="sr-only">Notifications</span>
              </Button>

              <div className="hidden h-8 w-px bg-border sm:block" />

              <div className="relative">
                <button
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-expanded={profileOpen}
                  className="flex items-center gap-2 rounded-xl px-1 py-1 transition-colors hover:bg-secondary"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-[linear-gradient(110deg,#003BC5_0%,#4B20D8_28%,#A52BC4_48%,#F02B75_68%,#FF9A1F_84%,#16BFC4_100%)] text-sm font-semibold text-[#ffffff] shadow-[0_6px_16px_rgba(80,32,190,0.22)]">
                    {firstName.charAt(0).toUpperCase()}
                  </div>

                  <span className="hidden text-sm font-medium sm:block">
                    {firstName}
                  </span>

                  <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 z-20 flex w-44 flex-col gap-1 rounded-xl bg-card p-2 shadow-xl ring-1 ring-foreground/10">
                    <button
                      onClick={() => router.push('/credits')}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-secondary"
                    >
                      <Coins className="size-4 text-primary" />
                      Credits
                      <span className="ml-auto text-xs text-muted-foreground">
                        {credits.toLocaleString()}
                      </span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10"
                    >
                      <ArrowDownRight className="size-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative mb-8 min-h-[420px] overflow-hidden rounded-[28px] bg-[linear-gradient(110deg,#003BC5_0%,#4B20D8_28%,#A52BC4_48%,#F02B75_68%,#FF9A1F_84%,#16BFC4_100%)] px-6 py-8 text-[#ffffff] shadow-[0_24px_60px_rgba(80,32,190,0.22)] sm:min-h-[434px] sm:px-10 sm:py-10 lg:min-h-[460px]"
            >
              <div className="absolute left-6 top-8 z-10 max-w-xl sm:left-10 lg:top-10">
                <div>
                <Badge className="mb-5 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/10">
                  AI creative studio
                </Badge>

                <h2 className="max-w-lg font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                  Make more, from one creative space.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-6 text-primary-foreground/75 sm:text-base">
                  Create videos, stories, prompts, voices, copy, and landing
                  pages with AI built for your ideas.
                </p>

                </div>

                <div className="mt-10 flex flex-wrap gap-3 sm:mt-12">
                  <Button
                    size="lg"
                    onClick={() => router.push('/infographics')}
                    className="h-12 gap-2 rounded-xl bg-[linear-gradient(100deg,#ff2fae,#ff9b24)] px-6 font-semibold text-[#ffffff] shadow-[0_12px_26px_rgba(255,104,73,0.34)] transition-transform hover:-translate-y-0.5 hover:brightness-105"
                  >
                    <Sparkles className="size-4" />
                    Start creating
                  </Button>

                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => router.push('/write-ads')}
                    className="h-12 gap-2 rounded-xl border border-[#ffffff66] bg-[#ffffff18] px-6 font-semibold text-[#ffffff] shadow-[0_8px_20px_rgba(40,16,130,0.12)] backdrop-blur-sm transition-colors hover:bg-[#ffffff2e] hover:text-[#ffffff]"
                  >
                    Explore tools
                    <ArrowUpRight className="size-4" />
                  </Button>
                </div>
              </div>

              <div
                className="absolute inset-0 block"
                aria-label="Vivafy AI Studio preview"
              >
                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/iiiss-BUNRCsdNGUfyMDU89Od83B0y4IYu99.png" alt="Vivafy AI Studio creative workspace" className="absolute inset-y-0 right-0 h-full w-[58%] object-contain object-right" />
                <motion.div
                  animate={{ y: [0, -6, 0], rotate: [-5, -3, -5] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="hidden absolute left-5 top-8 h-52 w-36 rotate-[-5deg] overflow-hidden rounded-xl border-0 bg-card shadow-xl sm:left-8 sm:h-60 sm:w-40"
                >
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/05e11a90-b09f-46ce-a180-e0b66359915a-x7uuvU1UvRnxfxuoRoU5TLFmZUMlNf.png"
                    alt="Illustrated girl crossing a bridge toward a castle"
                    className="absolute inset-0 size-full object-cover object-left"
                  />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 7, 0], rotate: [5, 3, 5] }}
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.4,
                  }}
                  className="hidden absolute right-5 top-2 h-56 w-40 rotate-[5deg] overflow-hidden rounded-xl border-0 bg-card shadow-xl sm:right-10 sm:h-64 sm:w-44"
                >
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d8709357-ed4c-4604-bd9b-f76d9f9b9f6c-YlLXmMINiS73ChLuUBuakrpyt4aPf3.png"
                    alt="Illustrated Open Chapters book cover"
className="absolute inset-y-0 right-0 h-full w-full object-contain object-right sm:w-[58%]"
                  />
                </motion.div>

                <motion.div
                  animate={{ y: [0, -4, 0], rotate: [1, 0, 1] }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.8,
                  }}
                  className="hidden absolute bottom-0 left-1/2 h-44 w-32 -translate-x-1/2 rotate-[1deg] overflow-hidden rounded-xl border-0 bg-card shadow-2xl sm:h-52 sm:w-36"
                >
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bc0f1e79-8ba1-4946-8884-d04123beb4c7-prTkTa3cfVFHbCMckWEnwBt6qpb39u.png"
                    alt="Illustrated garden scene with two children riding a bicycle"
                    className="absolute inset-0 size-full object-cover object-right"
                  />
                </motion.div>

                <div className="absolute bottom-[-1.25rem] left-1/2 flex -translate-x-1/2 items-center gap-2">
                  <span className="size-2 rounded-full bg-primary-foreground" />
                  <span className="size-2 rounded-full bg-primary-foreground/40" />
                  <span className="size-2 rounded-full bg-primary-foreground/40" />
                  <span className="size-2 rounded-full bg-primary-foreground/40" />
                </div>
              </div>
            </motion.section>

            {activeMetric && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="mb-4 flex items-center justify-between rounded-2xl border border-[#8b2de233] bg-[linear-gradient(90deg,#f7f0ff,#eefcff)] px-4 py-3 text-sm text-[#252548] shadow-[0_8px_24px_rgba(139,45,226,0.1)]" role="status">
                <span><span className="font-semibold text-[#8b2de2]">{activeMetric}:</span> total figures from our communities generations.</span>
                <button type="button" aria-label="Dismiss metric details" onClick={() => setActiveMetric(null)} className="ml-4 rounded-full px-2 py-1 text-[#8b2de2] transition hover:bg-[#8b2de21a]">×</button>
              </motion.div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ['AI generations', mediaCounts.images + mediaCounts.videos, 100, Sparkles, '#5b31e8', '#f0edff'],
                ['Video renders', mediaCounts.videos, mediaCounts.images + mediaCounts.videos > 0 ? (mediaCounts.videos / (mediaCounts.images + mediaCounts.videos)) * 100 : 0, Video, '#ed2b9b', '#fff0f8'],
                ['Image gen', mediaCounts.images, mediaCounts.images + mediaCounts.videos > 0 ? (mediaCounts.images / (mediaCounts.images + mediaCounts.videos)) * 100 : 0, ImageIcon, '#10b4c8', '#e8fbfd'],
              ].map(([label, value, percentage, Icon, color, tint], index) => (
                <motion.div
                  key={label as string}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07 }}
                >
                  <Card className="h-full rounded-2xl border-0 bg-[#ffffff] shadow-[0_4px_18px_rgba(35,35,110,0.04)]">
                    <CardContent className="flex flex-col gap-4 p-5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-3 text-sm font-medium text-[#15165c]">
                          <span className="flex size-10 items-center justify-center rounded-full" style={{ backgroundColor: color as string, color: '#ffffff' }}><Icon className="size-5" /></span>
                          {label as string}
                        </span>
                        <button type="button" aria-label={`View ${label as string} details`} onClick={() => setActiveMetric(label as string)} className="rounded-full p-1 text-[#15165c] transition hover:bg-[#8b2de21a] hover:text-[#8b2de2]"><MoreHorizontal className="size-5" /></button>
                      </div>

                      <div className="flex items-end justify-between gap-2">
                        <span className="font-serif text-[28px] font-semibold tracking-tight text-[#15165c]">
                          {value as string}
                        </span>

                        <Badge
                          variant="secondary"
                          className="gap-1 rounded-full border-0 font-semibold"
                          style={{ backgroundColor: tint as string, color: color as string }}
                        >
                          <Icon className="size-3" />
                          {`+${(percentage as number).toFixed(1)}%`}
                        </Badge>
                      </div>

                      <div className="h-1.5 rounded-full bg-[#e8e7f5]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${percentage as number}%`,
                          }}
                          transition={{
                            duration: 0.9,
                            delay: index * 0.12,
                            ease: 'easeOut',
                          }}
                          className="h-1.5 rounded-full" style={{ backgroundColor: color as string }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card className="border-0 bg-[#ffffff] shadow-[0_4px_18px_rgba(35,35,110,0.04)]">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <CardTitle className="text-base">Infographics</CardTitle>
                    <CardDescription className="mt-1">Turn ideas into visual stories.</CardDescription>
                  </div>
                  <Button type="button" onClick={() => router.push('/infographics')} className="rounded-xl bg-[linear-gradient(90deg,#8b2de2,#17d5da)] font-semibold text-white hover:brightness-110">
                    Open
                    <ArrowUpRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-0 bg-[#ffffff] shadow-[0_4px_18px_rgba(35,35,110,0.04)]">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <CardTitle className="text-base">Write ads</CardTitle>
                    <CardDescription className="mt-1">Create high-converting ad copy.</CardDescription>
                  </div>
                  <Button type="button" onClick={() => router.push('/write-ads')} className="rounded-xl bg-[linear-gradient(90deg,#8b2de2,#17d5da)] font-semibold text-white hover:brightness-110">
                    Open
                    <ArrowUpRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
              <Card className="border-0 bg-[#ffffff] shadow-[0_4px_18px_rgba(35,35,110,0.04)]">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>Generation activity</CardTitle>
                    <CardDescription>
                      Creative output this month
                    </CardDescription>
                  </div>

                  <Button variant="outline" size="sm" className="gap-2">
                    Last 8 weeks
                    <ChevronDown className="size-3.5" />
                  </Button>
                </CardHeader>

                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={mediaActivity.images}
                      margin={{
                        left: -20,
                        right: 8,
                        top: 12,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="revenueStroke"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0">
                          <stop offset="0%" stopColor="#5b31e8" />
                          <stop offset="48%" stopColor="#d52ca8" />
                          <stop offset="100%" stopColor="#ff8b35" />
                        </linearGradient>
                        <linearGradient
                          id="revenueFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#d52ca8"
                            stopOpacity={0.22}
                          />
                          <stop
                            offset="100%"
                            stopColor="#d52ca8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        vertical={false}
                        stroke="#e9e8f3"
                        strokeDasharray="3 5"
                      />

                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tickFormatter={(v) => `$${v / 1000}k`}
                      />

                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            indicator="line"
                            formatter={(value) => [
                              `$${Number(value).toLocaleString()}`,
                              'Revenue',
                            ]}
                          />
                        }
                      />

                      <Area
                        dataKey="images"
                        type="natural"
                        fill="url(#revenueFill)"
                        stroke="url(#revenueStroke)"
                        strokeWidth={3}
                        dot={{
                          r: 5,
                          fill: '#ffffff',
                          stroke: '#c92aa8',
                          strokeWidth: 3,
                        }}
                        activeDot={{
                          r: 7,
                          fill: '#ff8b35',
                          stroke: '#ffffff',
                          strokeWidth: 3,
                        }}
                      />
                    </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="border-0 bg-[#ffffff] shadow-[0_4px_18px_rgba(35,35,110,0.04)]">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>Assets this week</CardTitle>
                    <CardDescription>
                      Average 39 generations per day
                    </CardDescription>
                  </div>

                  <BarChart3 className="size-4 text-muted-foreground" />
                </CardHeader>

                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mediaActivity.videos}
                      margin={{
                        left: -25,
                        right: 0,
                        top: 12,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient id="activityBars" x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor="#16BFC4" />
                          <stop offset="42%" stopColor="#4B20D8" />
                          <stop offset="72%" stopColor="#F02B75" />
                          <stop offset="100%" stopColor="#FF9A1F" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        vertical={false}
                        stroke="#e9e8f3"
                        strokeDasharray="3 5"
                      />

                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                      />

                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />

                      <Bar
                        dataKey="videos"
                        radius={[6, 6, 0, 0]}
                        fill="url(#activityBars)"
                      >
                        {orders.map((entry) => <Cell key={`bar-${entry.day}`} fill="url(#activityBars)" />)}
                      </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
