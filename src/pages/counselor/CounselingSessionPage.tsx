import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function CounselingSessionPage() {
  const { user } = useAuth();
  const { students, notes, addCounselingNote, updateCounselingStatus } = useData();
  const assigned = students.filter(s => s.counselorId === user?.id);
  const [selectedStudent, setSelectedStudent] = useState<string>(assigned[0]?.id || '');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'resolved'>('in_progress');

  const studentNotes = notes.filter(n => n.studentId === selectedStudent);

  const handleAddNote = () => {
    if (!note.trim() || !selectedStudent) { toast.error('Please select a student and enter a note'); return; }
    addCounselingNote({
      studentId: selectedStudent,
      counselorId: user!.id,
      counselorName: user!.name,
      note: note.trim(),
      date: new Date().toISOString(),
      status,
    });
    updateCounselingStatus(selectedStudent, status);
    setNote('');
    toast.success('Counseling note added');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold font-display text-foreground">Counseling Sessions</h1>

      <div className="stat-card space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Select Student</label>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger><SelectValue placeholder="Choose student" /></SelectTrigger>
            <SelectContent>
              {assigned.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name} ({s.rollNumber})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Session Notes</label>
          <Textarea placeholder="Enter counseling notes..." value={note} onChange={e => setNote(e.target.value)} rows={4} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
          <Select value={status} onValueChange={(v: 'pending' | 'in_progress' | 'resolved') => setStatus(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleAddNote} disabled={!selectedStudent || !note.trim()}>Add Note</Button>
      </div>

      {/* Notes history */}
      {studentNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Session History</h3>
          {studentNotes.map(n => (
            <div key={n.id} className="stat-card space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-primary font-medium">{n.counselorName}</span>
                <span className="text-xs text-muted-foreground">{new Date(n.date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-foreground">{n.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
