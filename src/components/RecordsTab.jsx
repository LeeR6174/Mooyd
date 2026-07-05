import { formatTime } from '../utils/formatTime';

export function RecordsTab({ records }) {
  // Sort records newest first
  const sortedRecords = [...records].sort((a, b) => b.id - a.id);
  
  // Find max duration for the bar chart scaling
  const maxDuration = Math.max(...records.map(r => r.duration), 1); // fallback to 1 to avoid / 0

  return (
    <div className="records-tab animate-slide-down">
      <h2 className="tab-title">Study History</h2>
      {sortedRecords.length === 0 ? (
        <p className="empty-state">No study sessions recorded yet. Start studying!</p>
      ) : (
        <div className="records-list">
          {sortedRecords.map((record) => {
            const dateObj = new Date(record.date);
            const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const percentage = Math.min((record.duration / maxDuration) * 100, 100);

            return (
              <div key={record.id} className="record-item glass">
                <div className="record-header">
                  <span className="record-date">{dateStr}</span>
                  <span className="record-duration">{formatTime(record.duration)}</span>
                </div>
                <div className="record-bar-bg">
                  <div className="record-bar-fill" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
