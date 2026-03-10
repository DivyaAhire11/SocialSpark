import { useStories } from '../../hooks/useStories'
import { useSuggestions } from '../../hooks/useSuggestions'
import StoriesRow from '../story/StoriesRow'
import SuggestionsList from '../friend/SuggestionsList'
import Spinner from '../ui/Spinner'

const TRENDING = [
  { tag: '#technology', posts: '12.4K posts' },
  { tag: '#design', posts: '8.1K posts' },
  { tag: '#startup', posts: '5.3K posts' },
  { tag: '#coding', posts: '9.7K posts' },
  { tag: '#uiux', posts: '4.2K posts' },
]

export default function RightSidebar() {
  const { data: stories = [], isLoading: storiesLoading } = useStories()
  const { data: suggestions = [], isLoading: suggestionsLoading } = useSuggestions()

  return (
    <div className="space-y-3">

      {/* Stories */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-heading">Stories</h3>
          <button className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
            Add story
          </button>
        </div>
        {storiesLoading ? (
          <div className="flex justify-center py-3"><Spinner size="sm" /></div>
        ) : (
          <StoriesRow stories={stories} />
        )}
      </div>

      {/* People you may know */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="section-heading">Suggestions</h3>
          <button className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
            See all
          </button>
        </div>
        {suggestionsLoading ? (
          <div className="flex justify-center py-3"><Spinner size="sm" /></div>
        ) : suggestions.length > 0 ? (
          <SuggestionsList suggestions={suggestions} />
        ) : (
          <p className="text-sm text-gray-400 text-center py-3">No suggestions right now</p>
        )}
      </div>

      {/* Trending */}
      <div className="card p-4">
        <h3 className="section-heading mb-3">Trending</h3>
        <div className="space-y-2.5">
          {TRENDING.map(({ tag, posts }) => (
            <div key={tag} className="flex items-center justify-between group cursor-pointer py-0.5">
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{tag}</p>
                <p className="text-xs text-gray-400">{posts}</p>
              </div>
              <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                View
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 leading-relaxed px-1">
        © 2026 SocialSpark · Privacy · Terms · Cookies
      </p>
    </div>
  )
}
