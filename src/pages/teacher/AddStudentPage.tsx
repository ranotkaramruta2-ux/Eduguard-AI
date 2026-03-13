import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function AddStudentPage() {
  const { addStudent } = useData();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', rollNumber: '', attendancePercentage: '', internalMarks: '',
    assignmentCompletion: '', familyIncome: '', travelDistance: '',
    previousFailures: '', engagementScore: '',
  });

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.rollNumber) { toast.error('Name and Roll Number are required'); return; }
    addStudent({
      name: form.name,
      rollNumber: form.rollNumber,
      attendancePercentage: Number(form.attendancePercentage) || 0,
      internalMarks: Number(form.internalMarks) || 0,
      assignmentCompletion: Number(form.assignmentCompletion) || 0,
      familyIncome: Number(form.familyIncome) || 0,
      travelDistance: Number(form.travelDistance) || 0,
      previousFailures: Number(form.previousFailures) || 0,
      engagementScore: Number(form.engagementScore) || 0,
    });
    toast.success('Student added successfully!');
    navigate('/teacher/students');
  };

  const fields = [
    { key: 'name', label: 'Name', type: 'text', placeholder: 'Student name' },
    { key: 'rollNumber', label: 'Roll Number', type: 'text', placeholder: 'e.g. CS2024007' },
    { key: 'attendancePercentage', label: 'Attendance (%)', type: 'number', placeholder: '0-100' },
    { key: 'internalMarks', label: 'Internal Marks', type: 'number', placeholder: '0-100' },
    { key: 'assignmentCompletion', label: 'Assignment Completion (%)', type: 'number', placeholder: '0-100' },
    { key: 'familyIncome', label: 'Family Income (₹)', type: 'number', placeholder: 'Annual income' },
    { key: 'travelDistance', label: 'Travel Distance (km)', type: 'number', placeholder: 'Distance in km' },
    { key: 'previousFailures', label: 'Previous Failures', type: 'number', placeholder: 'Number of failures' },
    { key: 'engagementScore', label: 'Engagement Score', type: 'number', placeholder: '0-100' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Add Student</h1>
        <p className="text-muted-foreground text-sm">Enter student academic and demographic data</p>
      </div>
      <form onSubmit={handleSubmit} className="stat-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key} className="text-xs">{f.label}</Label>
              <Input id={f.key} type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                onChange={e => update(f.key, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Add Student</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teacher/students')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
