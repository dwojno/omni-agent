import { SidebarNavigation } from '@/components/navigation/SidebarNavigation'

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-hidden h-screen flex flex-col md:flex-row text-gray-300 bg-dark-bg">
      <SidebarNavigation />
      <div className="flex-1 flex min-w-0 overflow-hidden">{children}</div>
    </div>
  )
}
