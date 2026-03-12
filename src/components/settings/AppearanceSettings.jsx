import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Appearance Settings</h2>
        <p className="text-sm text-gray-500">Customize the visual interface of SocialSpark.</p>
      </div>

      <div className="space-y-8">
        
        {/* Theme Selection */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Monitor size={16} className="text-gray-400" />
            Theme Preference
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <button 
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border-2 text-left transition-colors flex flex-col items-center gap-3 ${
                theme === 'light' ? 'border-[#4F46E5] bg-blue-50/30' : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-yellow-500">
                <Sun size={24} />
              </div>
              <span className={`text-sm font-medium ${theme === 'light' ? 'text-blue-700' : 'text-gray-700'}`}>Light Mode</span>
            </button>

            <button 
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border-2 text-left transition-colors flex flex-col items-center gap-3 ${
                theme === 'dark' ? 'border-[#4F46E5] bg-blue-50/30' : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gray-900 shadow-sm flex items-center justify-center text-blue-200">
                <Moon size={24} />
              </div>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-700' : 'text-gray-700'}`}>Dark Mode</span>
            </button>

            <button 
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border-2 text-left transition-colors flex flex-col items-center gap-3 ${
                theme === 'system' ? 'border-[#4F46E5] bg-blue-50/30' : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-200 to-gray-800 shadow-sm flex items-center justify-center text-white">
                <Monitor size={20} />
              </div>
              <span className={`text-sm font-medium ${theme === 'system' ? 'text-blue-700' : 'text-gray-700'}`}>System Default</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  )
}
