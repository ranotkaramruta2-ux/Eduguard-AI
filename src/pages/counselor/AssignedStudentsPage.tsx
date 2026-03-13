import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import RiskBadge from '@/components/RiskBadge';

export default function AssignedStudentsPage() {
  const { user } = useAuth();
  const { students } = useData();
  const assigned = students.filter(s => s.counselorId === user?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display text-foreground">Assigned Students</h1>
      {assigned.length > 0 ? (
        <div className="stat-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">Roll No.</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Attendance</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Risk</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {assigned.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-3 font-medium text-foreground">{s.name}</td>
                  <td className="py-3 px-3 text-muted-foreground hidden sm:table-cell">{s.rollNumber}</td>
                  <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">{s.attendancePercentage}%</td>
                  <td className="py-3 px-3">{s.riskLevel && <RiskBadge level={s.riskLevel} showScore score={s.riskScore} />}</td>
                  <td className="py-3 px-3 capitalize text-xs">{s.counselingStatus?.replace('_', ' ') || 'pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="stat-card py-12 text-center">
          <p className="text-muted-foreground">No students assigned to you yet.</p>
        </div>
      )}
    </div>
  );
}
