import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import RiskBadge from '@/components/RiskBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, UserPlus, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentListPage() {
  const { students, assignCounselor, runPrediction, deleteStudent, counselors, fetchStudents, loadingStudents } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [assignDialogStudent, setAssignDialogStudent] = useState<string | null>(null);
  const [selectedCounselorId, setSelectedCounselorId] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [predictingId, setPredictingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async (studentId: string) => {
    if (!selectedCounselorId) {
      toast.error('Please select a counselor');
      return;
    }
    const counselor = counselors.find(c => c._id === selectedCounselorId);
    if (!counselor) return;

    setAssigningId(studentId);
    try {
      await assignCounselor(studentId, selectedCounselorId, counselor.name);
      toast.success(`Counselor ${counselor.name} assigned successfully!`);
      setAssignDialogStudent(null);
      setSelectedCounselorId('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign counselor');
    } finally {
      setAssigningId(null);
    }
  };

  const handlePredict = async (studentId: string) => {
    setPredictingId(studentId);
    try {
      const result = await runPrediction(studentId);
      toast.success(`Prediction: ${result.riskLevel} risk (score: ${result.riskScore}%)`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to run prediction');
    } finally {
      setPredictingId(null);
    }
  };

  const handleDelete = async (studentId: string, name: string) => {
    if (!window.confirm(`Delete student ${name}? This cannot be undone.`)) return;
    setDeletingId(studentId);
    try {
      await deleteStudent(studentId);
      toast.success(`Student ${name} deleted`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete student');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Students</h1>
          <p className="text-muted-foreground text-sm">{students.length} total students in database</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStudents} disabled={loadingStudents}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loadingStudents ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button size="sm" onClick={() => navigate('/teacher/add-student')}>
            <UserPlus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {loadingStudents ? (
        <div className="stat-card py-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading students from database...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="stat-card py-16 text-center">
          <p className="text-muted-foreground">
            {students.length === 0
              ? 'No students added yet. Click "Add" to add your first student.'
              : 'No students match your search.'}
          </p>
          {students.length === 0 && (
            <Button className="mt-4" onClick={() => navigate('/teacher/add-student')}>
              <UserPlus className="h-4 w-4 mr-2" /> Add First Student
            </Button>
          )}
        </div>
      ) : (
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
                  <td className="py-3 px-3 font-medium text-foreground">
                    <div>
                      <p>{s.name}</p>
                      {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground hidden sm:table-cell">{s.rollNumber}</td>
                  <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">{s.attendancePercentage}%</td>
                  <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">{s.internalMarks}</td>
                  <td className="py-3 px-3">
                    {s.riskLevel
                      ? <RiskBadge level={s.riskLevel} showScore score={s.riskScore} />
                      : <span className="text-xs text-muted-foreground">Not analyzed</span>}
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">
                    {s.counselorName || '—'}
                    {s.counselingStatus && (
                      <span className="ml-1 text-xs opacity-70">({s.counselingStatus.replace('_', ' ')})</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Predict button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        disabled={predictingId === s.id}
                        onClick={() => handlePredict(s.id)}
                      >
                        {predictingId === s.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          s.riskLevel ? 'Re-analyze' : 'Analyze'
                        )}
                      </Button>

                      {/* Assign Counselor button - only if no counselor yet OR risk is high */}
                      {(!s.counselorId || s.riskLevel === 'high') && (
                        <Dialog
                          open={assignDialogStudent === s.id}
                          onOpenChange={open => {
                            setAssignDialogStudent(open ? s.id : null);
                            if (!open) setSelectedCounselorId('');
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                              <UserPlus className="h-3 w-3" /> Assign
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Counselor to {s.name}</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm text-muted-foreground mb-3">
                              Select a counselor to assign to this student.
                              {s.riskLevel === 'high' && (
                                <span className="ml-1 text-destructive font-medium">⚠ High risk student</span>
                              )}
                            </p>
                            {counselors.length === 0 ? (
                              <p className="text-sm text-muted-foreground py-2">
                                No counselors available. Please register counselors first.
                              </p>
                            ) : (
                              <Select value={selectedCounselorId} onValueChange={setSelectedCounselorId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a counselor..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {counselors.map(c => (
                                    <SelectItem key={c._id} value={c._id}>
                                      <div>
                                        <span className="font-medium">{c.name}</span>
                                        <span className="text-muted-foreground ml-2 text-xs">{c.email}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <div className="flex gap-2 justify-end mt-4">
                              <Button variant="outline" onClick={() => setAssignDialogStudent(null)}>Cancel</Button>
                              <Button
                                onClick={() => handleAssign(s.id)}
                                disabled={!selectedCounselorId || assigningId === s.id}
                              >
                                {assigningId === s.id ? (
                                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Assigning...</>
                                ) : (
                                  'Confirm Assignment'
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-destructive hover:text-destructive"
                        disabled={deletingId === s.id}
                        onClick={() => handleDelete(s.id, s.name)}
                      >
                        {deletingId === s.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
