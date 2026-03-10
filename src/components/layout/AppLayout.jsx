import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import Navbar from './Navbar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <LeftSidebar />
            </div>
          </aside>

          {/* Center Feed */}
          <main className="flex-1 min-w-0 max-w-xl mx-auto lg:mx-0">
            <Outlet />
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <RightSidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
