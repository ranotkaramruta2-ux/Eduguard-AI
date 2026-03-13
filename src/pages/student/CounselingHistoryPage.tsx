import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function CounselingHistoryPage() {
  const { user } = useAuth();
  const { students, notes } = useData();
  const myStudent = students.find(s => s.userId === user?.id) ?? students[0];
  const myNotes = notes.filter(n => n.studentId === myStudent?.id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold font-display text-foreground">Counseling History</h1>
      {myNotes.length > 0 ? (
        <div className="space-y-3">
          {myNotes.map(n => (
            <div key={n.id} className="stat-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">{n.counselorName}</span>
                <span className="text-xs text-muted-foreground">{new Date(n.date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-foreground">{n.note}</p>
              <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
                n.status === 'resolved' ? 'bg-risk-low/10 text-risk-low' :
                n.status === 'in_progress' ? 'bg-risk-medium/10 text-risk-medium' :
                'bg-muted text-muted-foreground'
              }`}>
                {n.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="stat-card py-12 text-center">
          <p className="text-muted-foreground">No counseling sessions yet.</p>
        </div>
      )}
    </div>
  );
}
