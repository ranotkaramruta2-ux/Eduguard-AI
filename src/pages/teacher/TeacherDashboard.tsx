import { Users, ShieldAlert, UserCheck, TrendingUp } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import StatCard from '@/components/StatCard';
import RiskBadge from '@/components/RiskBadge';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RISK_COLORS } from '@/utils/constants';

export default function TeacherDashboard() {
  const { students } = useData();
  const navigate = useNavigate();

  const total = students.length;
  const high = students.filter(s => s.riskLevel === 'high').length;
  const medium = students.filter(s => s.riskLevel === 'medium').length;
  const low = students.filter(s => s.riskLevel === 'low').length;
  const unanalyzed = students.filter(s => !s.riskLevel).length;
  const counseled = students.filter(s => s.counselorId).length;

  const pieData = [
    { name: 'High Risk', value: high, color: RISK_COLORS.high },
    { name: 'Medium Risk', value: medium, color: RISK_COLORS.medium },
    { name: 'Low Risk', value: low, color: RISK_COLORS.low },
  ].filter(d => d.value > 0);

  const recentHighRisk = students.filter(s => s.riskLevel === 'high').slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Teacher Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of student dropout risk analysis</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={total} icon={Users} variant="primary" />
        <StatCard title="High Risk" value={high} subtitle={`${unanalyzed} unanalyzed`} icon={ShieldAlert} variant="danger" />
        <StatCard title="Counseling Active" value={counseled} icon={UserCheck} variant="accent" />
        <StatCard title="Avg Risk Score" value={total ? Math.round(students.reduce((a, s) => a + (s.riskScore ?? 0), 0) / total) + '%' : '0%'} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk distribution chart */}
        <div className="stat-card">
          <h3 className="font-semibold text-foreground mb-4 font-display">Risk Distribution</h3>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 -mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    {d.name}: {d.value}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-12 text-center">No predictions run yet</p>
          )}
        </div>

        {/* High risk students */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground font-display">High Risk Students</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/teacher/students')}>View All</Button>
          </div>
          {recentHighRisk.length > 0 ? (
            <div className="space-y-3">
              {recentHighRisk.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.rollNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge level="high" showScore score={s.riskScore} />
                    {!s.counselorId && (
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => navigate('/teacher/students')}>
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-12 text-center">No high-risk students detected</p>
          )}
        </div>
      </div>
    </div>
  );
}
