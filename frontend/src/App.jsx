import { useFetch } from './hooks/useFetch';
import WeeklySummary from './components/WeeklySummary';
import Sprout from './components/Sprout';
import RecommendationList from './components/RecommendationList';

const USER_ID = 1;
const WEEK_START = '2025-01-01';
const WEEK_END = '2025-01-07';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function App() {
  const { data: summary, loading: summaryLoading, error: summaryError } = useFetch(
    `${API_BASE}/users/${USER_ID}/weekly-summary?week_start=${WEEK_START}&week_end=${WEEK_END}`
  );
  const { data: recommendations, loading: recsLoading, error: recsError } = useFetch(
    `${API_BASE}/users/${USER_ID}/recommendations`
  );
  const { data: sprout, loading: sproutLoading, error: sproutError } = useFetch(
    `${API_BASE}/users/${USER_ID}/sprout`
  );

  if (summaryLoading || recsLoading || sproutLoading) {
    return <div className="p-5 text-center">Loading your mobility data...</div>;
  }
  if (summaryError || recsError || sproutError) {
    return <div className="p-5 text-center text-red-500">Error loading data. Please try again later.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen">
      <WeeklySummary data={summary} />
      <Sprout data={sprout} />
      <RecommendationList recommendations={recommendations?.recommendations || []} />
    </div>
  );
}

export default App;