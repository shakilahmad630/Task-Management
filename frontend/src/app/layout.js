import Providers from '@/components/Providers'
import '@/styles/globals.css'

export const metadata = {
  title: 'TaskFlow — Task Management',
  description: 'A simple and powerful task management application.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
