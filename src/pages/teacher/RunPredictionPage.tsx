import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle } from 'lucide-react';
import RiskBadge from '@/components/RiskBadge';
import { toast } from 'sonner';

export default function RunPredictionPage() {
  const { students, runAllPredictions, runPrediction } = useData();

  const handleRunAll = () => {
    runAllPredictions();
    toast.success('Predictions complete for all students!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Run Prediction</h1>
          <p className="text-muted-foreground text-sm">AI-powered dropout risk analysis</p>
        </div>
        <Button onClick={handleRunAll} className="gap-2">
          <Brain className="h-4 w-4" /> Analyze All Students
        </Button>
      </div>

      <div className="grid gap-3">
        {students.map(s => (
          <div key={s.id} className="stat-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.rollNumber} • Attendance: {s.attendancePercentage}% • Marks: {s.internalMarks}</p>
            </div>
            <div className="flex items-center gap-3">
              {s.riskLevel ? (
                <>
                  <RiskBadge level={s.riskLevel} showScore score={s.riskScore} />
                  <CheckCircle className="h-4 w-4 text-risk-low" />
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => {
                  const r = runPrediction(s.id);
                  toast.success(`${s.name}: ${r.riskLevel} risk (${r.riskScore}%)`);
                }}>
                  <Brain className="h-3 w-3 mr-1" /> Analyze
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
