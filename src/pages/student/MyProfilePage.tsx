import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function MyProfilePage() {
  const { user } = useAuth();
  const { students } = useData();
  const myStudent = students.find(s => s.userId === user?.id) ?? students[0];

  const fields = myStudent ? [
    { label: 'Name', value: myStudent.name },
    { label: 'Roll Number', value: myStudent.rollNumber },
    { label: 'Attendance', value: `${myStudent.attendancePercentage}%` },
    { label: 'Internal Marks', value: `${myStudent.internalMarks}` },
    { label: 'Assignment Completion', value: `${myStudent.assignmentCompletion}%` },
    { label: 'Family Income', value: `₹${myStudent.familyIncome.toLocaleString()}` },
    { label: 'Travel Distance', value: `${myStudent.travelDistance} km` },
    { label: 'Previous Failures', value: `${myStudent.previousFailures}` },
    { label: 'Engagement Score', value: `${myStudent.engagementScore}%` },
  ] : [];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm">{user?.email}</p>
      </div>
      <div className="stat-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.label} className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</p>
              <p className="text-sm font-medium text-foreground">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
