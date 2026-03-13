import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import StatCard from '@/components/StatCard';
import RiskBadge from '@/components/RiskBadge';
import { Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CounselorDashboard() {
  const { user } = useAuth();
  const { students, notes } = useData();

  const assigned = students.filter(s => s.counselorId === user?.id);
  const pending = assigned.filter(s => s.counselingStatus === 'pending');
  const inProgress = assigned.filter(s => s.counselingStatus === 'in_progress');
  const resolved = assigned.filter(s => s.counselingStatus === 'resolved');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Counselor Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Students" value={assigned.length} icon={Users} variant="primary" />
        <StatCard title="Pending" value={pending.length} icon={AlertTriangle} variant="danger" />
        <StatCard title="In Progress" value={inProgress.length} icon={Clock} />
        <StatCard title="Resolved" value={resolved.length} icon={CheckCircle} variant="accent" />
      </div>

      <div className="stat-card">
        <h3 className="font-semibold text-foreground font-display mb-4">Assigned Students</h3>
        {assigned.length > 0 ? (
          <div className="space-y-3">
            {assigned.map(s => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/50 gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.rollNumber} • {notes.filter(n => n.studentId === s.id).length} session notes</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.riskLevel && <RiskBadge level={s.riskLevel} showScore score={s.riskScore} />}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.counselingStatus === 'resolved' ? 'bg-risk-low/10 text-risk-low' :
                    s.counselingStatus === 'in_progress' ? 'bg-risk-medium/10 text-risk-medium' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {s.counselingStatus?.replace('_', ' ') || 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-8 text-center">No students assigned yet</p>
        )}
      </div>
    </div>
  );
}
