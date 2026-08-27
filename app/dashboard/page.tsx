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
  Users,
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
  CartesianGrid,
  XAxis,
  YAxis,
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

const navGroups = [
  {
    title: 'Workspace',
    items: [
      {
        label: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
        active: true,
      },
      {
        label: 'Library',
        href: '#',
        icon: Library,
        count: '128 assets',
      },
      {
        label: 'Prompt studios',
        href: '/prompt-studio',
        icon: WandSparkles,
      },
    ],
  },
  {
    title: 'Generate',
    items: [
      {
        label: 'Comic generator',
        href: '/comic',
        icon: FileImage,
      },
      {
        label: 'Video generator',
        href: '/text-video',
        icon: Video,
        count: 'Text + video',
      },
      {
        label: 'Image · Video',
        href: '/img-video',
        icon: ImageIcon,
      },
      {
        label: 'Image generator',
        href: '/text-image',
        icon: ImageIcon,
      },
      {
        label: 'Chat Image',
        href: '/chat-image',
        icon: MessageSquare,
      },
      {
        label: 'AI avatar',
        href: '/avatar',
        icon: Bot,
      },
      {
        label: 'Story',
        href: '/story',
        icon: Clapperboard,
      },
    ],
  },
  {
    title: 'Grow',
    items: [
      {
        label: 'Marketing',
        href: '/marketing',
        icon: Megaphone,
      },
      {
        label: 'Agentic',
        href: '/agentic',
        icon: Bot,
      },
      {
        label: 'Cover designs',
        href: '/cover',
        icon: BookOpen,
      },
      {
        label: 'Landing page builder',
        href: '/landings',
        icon: LayoutDashboard,
      },
      {
        label: 'Coloring book',
        href: '/coloring',
        icon: Palette,
      },
    ],
  },
]

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-2)' },
  orders: { label: 'Orders', color: 'var(--chart-3)' },
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

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/')
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
  const packageName = profile?.package || 'Free'
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
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-5 py-6 text-sidebar-foreground lg:flex">
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground text-primary">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c499285c-186e-4c66-8181-3b746e8fa908-d5JlRpN182u3UULfog6rqqzKJQqZK5.png"
                alt="Vivafy AI"
                className="size-9 rounded-xl bg-white object-contain p-1"
              />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight">
              Vivafy AI
            </span>
          </div>

          <div className="mt-10 flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
            {navGroups.map((group) => (
              <div key={group.title}>
                <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55">
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
                        item.active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                          : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <item.icon className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>

                      {item.count && (
                        <span className="ml-2 shrink-0 rounded-full bg-primary-foreground/12 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-sidebar-foreground/75">
                          {item.count}
                        </span>
                      )}
                    </a>
                  ))}
                </nav>
              </div>
            ))}

            <div>
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55">
                Manage
              </p>

              <nav className="flex flex-col gap-1">
                <a
                  href="/reseller"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <CircleDollarSign className="size-4" />
                  Reseller
                </a>

                <a
                  href="/white"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <Globe2 className="size-4" />
                  White label
                </a>

                <a
                  href="/connections"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <Users className="size-4" />
                  Connections
                </a>
              </nav>
            </div>
          </div>

          <div className="rounded-xl bg-muted/70 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium">
              <CircleHelp className="size-4" />
              Need some help?
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              Visit our help center to learn more about zeyroh.
            </p>

            <Button variant="link" className="mt-2 h-auto p-0 text-xs">
              Open help center
              <ArrowUpRight className="ml-1 size-3" />
            </Button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground text-primary lg:hidden">
                <Sparkles className="size-4" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
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
                  <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                    {firstName.charAt(0).toUpperCase()}
                  </div>

                  <span className="hidden text-sm font-medium sm:block">
                    {firstName}
                  </span>

                  <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 z-20 flex w-44 flex-col gap-1 rounded-xl bg-card p-2 shadow-xl ring-1 ring-foreground/10">
                    <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-secondary">
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
              className="relative mb-8 overflow-hidden rounded-2xl bg-primary px-6 py-8 text-primary-foreground shadow-sm sm:px-10 sm:py-10"
            >
              <div className="relative z-10 max-w-xl">
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

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="h-11 gap-2 rounded-xl bg-accent px-5 font-semibold text-accent-foreground shadow-lg shadow-accent/20 hover:bg-accent/90"
                  >
                    <Sparkles className="size-4" />
                    Start creating
                  </Button>

                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-11 gap-2 rounded-xl bg-primary-foreground/15 px-5 font-semibold text-primary-foreground shadow-none hover:bg-primary-foreground/25 hover:text-primary-foreground"
                  >
                    Explore tools
                    <ArrowUpRight className="size-4" />
                  </Button>
                </div>
              </div>

              <div
                className="relative mt-8 min-h-[245px] sm:absolute sm:inset-y-0 sm:right-6 sm:mt-0 sm:w-[46%] lg:right-10 lg:w-[40%]"
                aria-label="AI generated marketing campaign previews"
              >
                <motion.div
                  animate={{ y: [0, -6, 0], rotate: [-5, -3, -5] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute left-5 top-8 h-52 w-36 rotate-[-5deg] overflow-hidden rounded-xl border-0 bg-card shadow-xl sm:left-8 sm:h-60 sm:w-40"
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
                  className="absolute right-5 top-2 h-56 w-40 rotate-[5deg] overflow-hidden rounded-xl border-0 bg-card shadow-xl sm:right-10 sm:h-64 sm:w-44"
                >
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d8709357-ed4c-4604-bd9b-f76d9f9b9f6c-YlLXmMINiS73ChLuUBuakrpyt4aPf3.png"
                    alt="Illustrated Open Chapters book cover"
                    className="absolute inset-0 size-full object-cover object-center"
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
                  className="absolute bottom-0 left-1/2 h-44 w-32 -translate-x-1/2 rotate-[1deg] overflow-hidden rounded-xl border-0 bg-card shadow-2xl sm:h-52 sm:w-36"
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

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['AI generations', '12,840', '+28.4%', ArrowUpRight],
                ['Video renders', '1,284', '+18.7%', ArrowUpRight],
                ['Voice minutes', '8,549', '+32.1%', ArrowUpRight],
                ['Campaign lift', '4.82x', '+8.6%', ArrowUpRight],
              ].map(([label, value, change, Icon], index) => (
                <motion.div
                  key={label as string}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07 }}
                >
                  <Card className="h-full">
                    <CardContent className="flex flex-col gap-4 p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {label as string}
                        </span>
                        <MoreHorizontal className="size-4 text-muted-foreground" />
                      </div>

                      <div className="flex items-end justify-between gap-2">
                        <span className="font-serif text-2xl font-semibold tracking-tight">
                          {value as string}
                        </span>

                        <Badge
                          variant={index === 3 ? 'outline' : 'secondary'}
                          className="gap-1 font-normal"
                        >
                          <Icon className="size-3" />
                          {change as string}
                        </Badge>
                      </div>

                      <div className="h-1 rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${[76, 62, 84, 48][index]}%`,
                          }}
                          transition={{
                            duration: 0.9,
                            delay: index * 0.12,
                            ease: 'easeOut',
                          }}
                          className="h-1 rounded-full bg-primary"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
              <Card>
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
                    className="h-[280px] w-full"
                  >
                    <AreaChart
                      data={revenue}
                      margin={{
                        left: -20,
                        right: 8,
                        top: 12,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="revenueFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--color-revenue)"
                            stopOpacity={0.22}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--color-revenue)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="4 4"
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
                        dataKey="revenue"
                        type="natural"
                        fill="url(#revenueFill)"
                        stroke="var(--color-revenue)"
                        strokeWidth={2.5}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
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
                    className="h-[280px] w-full"
                  >
                    <BarChart
                      data={orders}
                      margin={{
                        left: -25,
                        right: 0,
                        top: 12,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="4 4"
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
                        dataKey="orders"
                        fill="var(--color-orders)"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
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
