import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vivafy AI — Your Go-To AI',
  description: 'Vivafy AI — Your Go-To AI',
  generator: 'Vivafy AI',

  icons: {
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/login-logo-Dww63hMTeNQcRt14HmV5VEtxAUnAnF.png',
    shortcut:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/login-logo-Dww63hMTeNQcRt14HmV5VEtxAUnAnF.png',
    apple:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/login-logo-Dww63hMTeNQcRt14HmV5VEtxAUnAnF.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}