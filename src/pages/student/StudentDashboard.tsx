import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import StatCard from '@/components/StatCard';
import RiskBadge from '@/components/RiskBadge';
import { ShieldAlert, UserCheck, MessageSquare, GraduationCap, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { counselingAPI } from '@/lib/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { students, fetchStudents, loadingStudents } = useData();
  const [counselingHistory, setCounselingHistory] = useState<any[]>([]);
  const [loadingCounseling, setLoadingCounseling] = useState(false);

  // Find this student's record
  const myStudent = students.find(s => s.userId === user?.id);

  useEffect(() => {
    if (myStudent?.id) {
      loadCounselingHistory(myStudent.id);
    }
  }, [myStudent?.id]);

  const loadCounselingHistory = async (studentId: string) => {
    setLoadingCounseling(true);
    try {
      const res = await counselingAPI.getForStudent(studentId);
      setCounselingHistory(res.data);
    } catch (err) {
      console.error('Failed to load counseling history:', err);
    } finally {
      setLoadingCounseling(false);
    }
  };

  const totalNotes = counselingHistory.reduce((a, r) => a + (r.notes?.length || 0), 0);

  if (loadingStudents) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading your profile...</span>
      </div>
    );
  }

  if (!myStudent) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">
          No student record found for your account.
        </p>
        <p className="text-xs text-muted-foreground">
          Your teacher needs to add you to the system using your email address.
        </p>
        <Button variant="outline" size="sm" onClick={fetchStudents}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {user?.name} ({myStudent.rollNumber})</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStudents} disabled={loadingStudents}>
          <RefreshCw className={`h-4 w-4 ${loadingStudents ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Risk Score"
          value={myStudent.riskScore !== undefined ? `${myStudent.riskScore}%` : 'N/A'}
          icon={ShieldAlert}
          variant={myStudent.riskLevel === 'high' ? 'danger' : myStudent.riskLevel === 'medium' ? 'default' : 'accent'}
        />
        <StatCard title="Attendance" value={`${myStudent.attendancePercentage}%`} icon={GraduationCap} variant="primary" />
        <StatCard title="Counselor" value={myStudent.counselorName || 'Not assigned'} icon={UserCheck} />
        <StatCard title="Counseling Sessions" value={totalNotes} icon={MessageSquare} variant="accent" />
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
                <div
                  className={`h-full rounded-full transition-all ${
                    myStudent.riskLevel === 'high' ? 'bg-destructive' :
                    myStudent.riskLevel === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${myStudent.riskScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{myStudent.recommendation}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Risk assessment has not been performed yet by your teacher.
            </p>
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
          <div className="pt-2 border-t border-border space-y-1 text-xs text-muted-foreground">
            <p>Family Income: ₹{myStudent.familyIncome?.toLocaleString()}/yr</p>
            <p>Travel Distance: {myStudent.travelDistance} km</p>
            <p>Previous Failures: {myStudent.previousFailures}</p>
          </div>
        </div>
      </div>

      {/* Counseling History */}
      {loadingCounseling ? (
        <div className="stat-card py-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : counselingHistory.length > 0 && (
        <div className="stat-card space-y-4">
          <h3 className="font-semibold text-foreground font-display">
            Counseling History ({totalNotes} note{totalNotes !== 1 ? 's' : ''})
          </h3>
          {myStudent.counselorName && (
            <p className="text-sm text-muted-foreground">
              Assigned counselor: <span className="font-medium text-foreground">{myStudent.counselorName}</span>
              {myStudent.counselingStatus && (
                <span className="ml-2 text-xs opacity-70">({myStudent.counselingStatus.replace('_', ' ')})</span>
              )}
            </p>
          )}
          <div className="space-y-3">
            {counselingHistory.map(record =>
              record.notes.map((n: any) => (
                <div key={n._id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">
                      {n.addedBy?.name || 'Counselor'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{n.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
