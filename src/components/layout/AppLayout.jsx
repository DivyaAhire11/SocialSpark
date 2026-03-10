import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import Navbar from './Navbar'

export default function AppLayout() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <Navbar />
      {/* pt-14 matches navbar h-14 (56px). Extra pt-5 adds breathing room below navbar. */}
      <div className="max-w-7xl mx-auto px-4 pt-14">
        <div className="flex gap-5 pt-5">

          {/* Left Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-[72px]">
              <LeftSidebar />
            </div>
          </aside>

          {/* Center Feed */}
          <main className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0 pb-8">
            <Outlet />
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-[72px]">
              <RightSidebar />
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
