import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import RiskBadge from '@/components/RiskBadge';

export default function MyRiskStatusPage() {
  const { user } = useAuth();
  const { students } = useData();
  const myStudent = students.find(s => s.userId === user?.id) ?? students[0];

  if (!myStudent || !myStudent.riskLevel) {
    return (
      <div className="max-w-xl space-y-6">
        <h1 className="text-2xl font-bold font-display text-foreground">My Risk Status</h1>
        <div className="stat-card py-12 text-center">
          <p className="text-muted-foreground">Risk assessment has not been performed yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold font-display text-foreground">My Risk Status</h1>
      <div className="stat-card space-y-6">
        <div className="text-center space-y-3">
          <div className={`inline-flex h-24 w-24 rounded-full items-center justify-center text-3xl font-bold ${
            myStudent.riskLevel === 'high' ? 'bg-risk-high/10 text-risk-high' :
            myStudent.riskLevel === 'medium' ? 'bg-risk-medium/10 text-risk-medium' :
            'bg-risk-low/10 text-risk-low'
          }`}>
            {myStudent.riskScore}%
          </div>
          <div><RiskBadge level={myStudent.riskLevel} /></div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">{myStudent.recommendation}</p>
        </div>
        {myStudent.counselorName && (
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">Assigned Counselor</p>
            <p className="text-sm font-medium text-foreground">{myStudent.counselorName}</p>
            <p className="text-xs text-muted-foreground capitalize">Status: {myStudent.counselingStatus?.replace('_', ' ') || 'Pending'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
