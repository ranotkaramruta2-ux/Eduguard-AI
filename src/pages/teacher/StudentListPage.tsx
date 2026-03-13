import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import RiskBadge from '@/components/RiskBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, UserPlus } from 'lucide-react';

export default function StudentListPage() {
  const { students, assignCounselor, runPrediction } = useData();
  const [search, setSearch] = useState('');
  const [assignDialogStudent, setAssignDialogStudent] = useState<string | null>(null);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = (studentId: string) => {
    assignCounselor(studentId, '3', 'Dr. Emily Chen');
    toast.success('Counselor assigned successfully');
    setAssignDialogStudent(null);
  };

  const handlePredict = (studentId: string) => {
    const result = runPrediction(studentId);
    toast.success(`Prediction complete: ${result.riskLevel} risk (${result.riskScore}%)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Students</h1>
          <p className="text-muted-foreground text-sm">{students.length} total students</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="stat-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">Roll No.</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Attendance</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Marks</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Risk</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Counselor</th>
              <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-3 px-3 font-medium text-foreground">{s.name}</td>
                <td className="py-3 px-3 text-muted-foreground hidden sm:table-cell">{s.rollNumber}</td>
                <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">{s.attendancePercentage}%</td>
                <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">{s.internalMarks}</td>
                <td className="py-3 px-3">
                  {s.riskLevel ? <RiskBadge level={s.riskLevel} showScore score={s.riskScore} /> : <span className="text-xs text-muted-foreground">Not analyzed</span>}
                </td>
                <td className="py-3 px-3 text-xs text-muted-foreground">{s.counselorName || '—'}</td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {!s.riskLevel && (
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handlePredict(s.id)}>Analyze</Button>
                    )}
                    {s.riskLevel === 'high' && !s.counselorId && (
                      <Dialog open={assignDialogStudent === s.id} onOpenChange={open => setAssignDialogStudent(open ? s.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                            <UserPlus className="h-3 w-3" /> Assign
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Counselor to {s.name}</DialogTitle>
                          </DialogHeader>
                          <p className="text-sm text-muted-foreground">Assign Dr. Emily Chen as counselor for this high-risk student?</p>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setAssignDialogStudent(null)}>Cancel</Button>
                            <Button onClick={() => handleAssign(s.id)}>Confirm Assignment</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
