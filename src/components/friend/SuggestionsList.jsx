import FriendSuggestion from './FriendSuggestion'

export default function SuggestionsList({ suggestions = [] }) {
  return (
    <div className="divide-y divide-gray-50">
      {suggestions.map(user => (
        <FriendSuggestion key={user.id} user={user} />
      ))}
    </div>
  )
}
