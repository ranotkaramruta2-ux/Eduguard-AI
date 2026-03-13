import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import StatCard from '@/components/StatCard';
import RiskBadge from '@/components/RiskBadge';
import { ShieldAlert, UserCheck, MessageSquare, GraduationCap } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { students, notes } = useData();

  // Find student data (mock: first student with userId matching or first high-risk)
  const myStudent = students.find(s => s.userId === user?.id) ?? students[0];
  const myNotes = notes.filter(n => n.studentId === myStudent?.id);

  if (!myStudent) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No student data found for your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Risk Score" value={myStudent.riskScore ? `${myStudent.riskScore}%` : 'N/A'} icon={ShieldAlert}
          variant={myStudent.riskLevel === 'high' ? 'danger' : myStudent.riskLevel === 'medium' ? 'default' : 'accent'} />
        <StatCard title="Attendance" value={`${myStudent.attendancePercentage}%`} icon={GraduationCap} variant="primary" />
        <StatCard title="Counselor" value={myStudent.counselorName || 'Not assigned'} icon={UserCheck} />
        <StatCard title="Sessions" value={myNotes.length} icon={MessageSquare} variant="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Status */}
        <div className="stat-card space-y-4">
          <h3 className="font-semibold text-foreground font-display">Risk Assessment</h3>
          {myStudent.riskLevel ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <RiskBadge level={myStudent.riskLevel} showScore score={myStudent.riskScore} />
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${
                  myStudent.riskLevel === 'high' ? 'bg-risk-high' : myStudent.riskLevel === 'medium' ? 'bg-risk-medium' : 'bg-risk-low'
                }`} style={{ width: `${myStudent.riskScore}%` }} />
              </div>
              <p className="text-sm text-muted-foreground">{myStudent.recommendation}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Risk assessment not yet performed</p>
          )}
        </div>

        {/* Academic Summary */}
        <div className="stat-card space-y-4">
          <h3 className="font-semibold text-foreground font-display">Academic Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Internal Marks', value: myStudent.internalMarks },
              { label: 'Assignment Completion', value: myStudent.assignmentCompletion },
              { label: 'Engagement Score', value: myStudent.engagementScore },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Counseling History */}
      {myNotes.length > 0 && (
        <div className="stat-card space-y-4">
          <h3 className="font-semibold text-foreground font-display">Counseling History</h3>
          <div className="space-y-3">
            {myNotes.map(n => (
              <div key={n.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary">{n.counselorName}</span>
                  <span className="text-xs text-muted-foreground">{new Date(n.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-foreground">{n.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
