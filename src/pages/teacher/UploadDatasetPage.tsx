import { useCallback, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadDatasetPage() {
  const { addStudents } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState(false);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === 'text/csv') { setFile(f); setParsed(false); }
    else toast.error('Please upload a CSV file');
  }, []);

  const handleUpload = useCallback(() => {
    if (!file) return;
    // Simulate CSV parsing - in production would use Papa Parse
    const mockParsed = [
      { name: 'CSV Student 1', rollNumber: 'CSV001', attendancePercentage: 60, internalMarks: 50, assignmentCompletion: 45, familyIncome: 30000, travelDistance: 12, previousFailures: 1, engagementScore: 40 },
      { name: 'CSV Student 2', rollNumber: 'CSV002', attendancePercentage: 85, internalMarks: 78, assignmentCompletion: 90, familyIncome: 55000, travelDistance: 5, previousFailures: 0, engagementScore: 80 },
    ];
    addStudents(mockParsed);
    setParsed(true);
    toast.success(`${mockParsed.length} students imported successfully!`);
  }, [file, addStudents]);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Upload Dataset</h1>
        <p className="text-muted-foreground text-sm">Import student data from a CSV file</p>
      </div>

      <div className="stat-card space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Drag & drop or click to upload a CSV file
          </p>
          <input type="file" accept=".csv" onChange={handleFile} className="hidden" id="csv-upload" />
          <Button variant="outline" asChild>
            <label htmlFor="csv-upload" className="cursor-pointer">Choose File</label>
          </Button>
        </div>

        {file && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            {parsed && <CheckCircle className="h-5 w-5 text-risk-low" />}
          </div>
        )}

        <Button onClick={handleUpload} disabled={!file || parsed} className="w-full">
          {parsed ? 'Uploaded Successfully' : 'Upload & Import'}
        </Button>

        <div className="bg-muted rounded-lg p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Expected CSV Format</p>
          <code className="text-[10px] text-muted-foreground leading-relaxed block">
            name,rollNumber,attendancePercentage,internalMarks,assignmentCompletion,familyIncome,travelDistance,previousFailures,engagementScore
          </code>
        </div>
      </div>
    </div>
  );
}
