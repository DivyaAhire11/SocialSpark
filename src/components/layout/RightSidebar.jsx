import { useStories } from '../../hooks/useStories'
import { useSuggestions } from '../../hooks/useSuggestions'
import StoriesRow from '../story/StoriesRow'
import SuggestionsList from '../friend/SuggestionsList'
import Spinner from '../ui/Spinner'

export default function RightSidebar() {
  const { data: stories = [], isLoading: storiesLoading } = useStories()
  const { data: suggestions = [], isLoading: suggestionsLoading } = useSuggestions()

  return (
    <div className="space-y-4">
      {/* Stories */}
      <div className="card p-4">
        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Stories</h3>
        {storiesLoading ? (
          <div className="flex justify-center py-4"><Spinner size="sm" /></div>
        ) : (
          <StoriesRow stories={stories} />
        )}
      </div>

      {/* Friend Suggestions */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Suggestions</h3>
          <span className="text-xs text-primary-600 font-medium cursor-pointer hover:underline">See all</span>
        </div>
        {suggestionsLoading ? (
          <div className="flex justify-center py-4"><Spinner size="sm" /></div>
        ) : suggestions.length > 0 ? (
          <SuggestionsList suggestions={suggestions} />
        ) : (
          <p className="text-sm text-gray-400 text-center py-3">No suggestions available</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-2">
        <p className="text-xs text-gray-400 leading-relaxed">
          © 2026 SocialSpark · Privacy · Terms · Advertising · Cookies · More
        </p>
      </div>
    </div>
  )
}
