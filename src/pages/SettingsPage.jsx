import { useState, Suspense, lazy } from 'react'
import { 
  User, Shield, Bell, Palette, Lock, Menu, ChevronDown
} from 'lucide-react'
import Spinner from '../components/ui/Spinner'

// Lazy load functional settings components
const ProfileSettings = lazy(() => import('../components/settings/ProfileSettings'))
const AccountSettings = lazy(() => import('../components/settings/AccountSettings'))
const PrivacySettings = lazy(() => import('../components/settings/PrivacySettings'))
const NotificationSettings = lazy(() => import('../components/settings/NotificationSettings'))
const AppearanceSettings = lazy(() => import('../components/settings/AppearanceSettings'))

const NAV_CATEGORIES = [
  { id: 'profile', label: 'Profile Settings', icon: User, Component: ProfileSettings },
  { id: 'account', label: 'Account Settings', icon: Shield, Component: AccountSettings },
  { id: 'privacy', label: 'Privacy Settings', icon: Lock, Component: PrivacySettings },
  { id: 'notifications', label: 'Notifications', icon: Bell, Component: NotificationSettings },
  { id: 'appearance', label: 'Appearance', icon: Palette, Component: AppearanceSettings },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const activeCategory = NAV_CATEGORIES.find(c => c.id === activeTab) || NAV_CATEGORIES[0]
  const ActiveComponent = activeCategory.Component

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row items-start" style={{ gap: '24px' }}>
        
        {/* Mobile Top Dropdown Selector */}
        <div className="w-full lg:hidden mb-4 relative">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3 font-medium text-gray-900">
              {(() => {
                const Icon = activeCategory.icon
                return <Icon size={20} className="text-blue-600" />
              })()}
              {activeCategory.label}
            </div>
            <ChevronDown size={20} className={`text-gray-500 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden animate-fade-in">
              {NAV_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isActive = activeTab === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveTab(cat.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left border-b border-gray-50 last:border-0 ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    {cat.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Desktop Left Sidebar Navigation */}
        <div 
          className="hidden lg:block shrink-0 card p-2 space-y-1 bg-white border border-gray-200 rounded-[10px]" 
          style={{ width: '260px' }}
        >
          {NAV_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = activeTab === cat.id
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {cat.label}
              </button>
            )
          })}
        </div>
        
        {/* Right Content Panel */}
        <div className="flex-1 w-full relative">
          <div className="card p-6 min-h-[500px] bg-white border border-gray-200 rounded-[10px]">
            <Suspense fallback={
              <div className="w-full h-full flex flex-col items-center justify-center p-20 text-gray-400 gap-4">
                <Spinner size="lg" />
                <p className="text-sm font-medium">Loading settings...</p>
              </div>
            }>
              <ActiveComponent />
            </Suspense>
          </div>
        </div>
        
      </div>
    </div>
  )
}
