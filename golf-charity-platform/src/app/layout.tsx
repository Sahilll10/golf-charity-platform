import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GolfDraw — Play. Win. Give.',
  description: 'The subscription platform where golf performance meets charitable giving and monthly prize draws.',
  keywords: ['golf', 'charity', 'prize draw', 'subscription', 'golf scores'],
  openGraph: {
    title: 'GolfDraw — Play. Win. Give.',
    description: 'Golf subscription platform with charity giving and monthly prize draws.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-surface-900 text-white antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a261a',
              color: '#fff',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
