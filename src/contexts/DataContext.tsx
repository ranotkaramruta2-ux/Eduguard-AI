import React, { createContext, useContext, useState, useCallback } from 'react';
import { Student, CounselingNote, Notification } from '@/utils/constants';
import { calculateRiskScore, getRiskLevel, getRiskRecommendation } from '@/utils/helpers';

interface DataContextType {
  students: Student[];
  notes: CounselingNote[];
  notifications: Notification[];
  addStudent: (s: Omit<Student, 'id'>) => void;
  addStudents: (s: Omit<Student, 'id'>[]) => void;
  runPrediction: (studentId: string) => Student;
  runAllPredictions: () => void;
  assignCounselor: (studentId: string, counselorId: string, counselorName: string) => void;
  addCounselingNote: (note: Omit<CounselingNote, 'id'>) => void;
  updateCounselingStatus: (studentId: string, status: 'pending' | 'in_progress' | 'resolved') => void;
  markNotificationRead: (id: string) => void;
  addNotification: (n: Omit<Notification, 'id'>) => void;
}

const DataContext = createContext<DataContextType | null>(null);

const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Rahul Kumar', rollNumber: 'CS2024001', attendancePercentage: 45, internalMarks: 35, assignmentCompletion: 30, familyIncome: 25000, travelDistance: 15, previousFailures: 2, engagementScore: 25, riskScore: 85, riskLevel: 'high', recommendation: 'Immediate counseling intervention recommended.', userId: '2' },
  { id: '2', name: 'Priya Sharma', rollNumber: 'CS2024002', attendancePercentage: 92, internalMarks: 88, assignmentCompletion: 95, familyIncome: 60000, travelDistance: 5, previousFailures: 0, engagementScore: 90, riskScore: 5, riskLevel: 'low', recommendation: 'Student is on track.' },
  { id: '3', name: 'Amit Patel', rollNumber: 'CS2024003', attendancePercentage: 65, internalMarks: 55, assignmentCompletion: 50, familyIncome: 35000, travelDistance: 20, previousFailures: 1, engagementScore: 45, riskScore: 55, riskLevel: 'medium', recommendation: 'Monitor closely.' },
  { id: '4', name: 'Sneha Gupta', rollNumber: 'CS2024004', attendancePercentage: 38, internalMarks: 28, assignmentCompletion: 20, familyIncome: 18000, travelDistance: 25, previousFailures: 3, engagementScore: 15, riskScore: 95, riskLevel: 'high', recommendation: 'Immediate counseling intervention recommended.', counselorId: '3', counselorName: 'Dr. Emily Chen', counselingStatus: 'in_progress' },
  { id: '5', name: 'Vikram Singh', rollNumber: 'CS2024005', attendancePercentage: 78, internalMarks: 72, assignmentCompletion: 80, familyIncome: 50000, travelDistance: 8, previousFailures: 0, engagementScore: 70, riskScore: 15, riskLevel: 'low', recommendation: 'Student is on track.' },
  { id: '6', name: 'Meera Iyer', rollNumber: 'CS2024006', attendancePercentage: 55, internalMarks: 42, assignmentCompletion: 45, familyIncome: 28000, travelDistance: 18, previousFailures: 2, engagementScore: 35, riskScore: 70, riskLevel: 'high', recommendation: 'Immediate counseling intervention recommended.', counselorId: '3', counselorName: 'Dr. Emily Chen', counselingStatus: 'pending' },
];

const INITIAL_NOTES: CounselingNote[] = [
  { id: '1', studentId: '4', counselorId: '3', counselorName: 'Dr. Emily Chen', note: 'Initial session completed. Student expressing financial difficulties and family pressure. Recommended scholarship application and peer tutoring.', date: '2024-12-10', status: 'in_progress' },
  { id: '2', studentId: '4', counselorId: '3', counselorName: 'Dr. Emily Chen', note: 'Follow-up session. Student mood improved. Started attending peer study group.', date: '2024-12-18', status: 'in_progress' },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', message: 'High-risk student detected: Sneha Gupta (Risk Score: 95)', type: 'risk', read: false, date: '2024-12-20', userId: '1' },
  { id: '2', message: 'Counselor assigned to Sneha Gupta', type: 'counseling', read: true, date: '2024-12-15', userId: '1' },
  { id: '3', message: 'Your counselor has been assigned: Dr. Emily Chen', type: 'counseling', read: false, date: '2024-12-15', userId: '2' },
  { id: '4', message: 'New student assigned: Meera Iyer', type: 'counseling', read: false, date: '2024-12-20', userId: '3' },
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [notes, setNotes] = useState<CounselingNote[]>(INITIAL_NOTES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const addStudent = useCallback((s: Omit<Student, 'id'>) => {
    setStudents(prev => [...prev, { ...s, id: Date.now().toString() }]);
  }, []);

  const addStudents = useCallback((ss: Omit<Student, 'id'>[]) => {
    setStudents(prev => [...prev, ...ss.map((s, i) => ({ ...s, id: (Date.now() + i).toString() }))]);
  }, []);

  const runPrediction = useCallback((studentId: string): Student => {
    let result: Student | undefined;
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const riskScore = calculateRiskScore(s);
      const riskLevel = getRiskLevel(riskScore);
      const recommendation = getRiskRecommendation(riskLevel);
      result = { ...s, riskScore, riskLevel, recommendation };
      return result;
    }));
    return result!;
  }, []);

  const runAllPredictions = useCallback(() => {
    setStudents(prev => prev.map(s => {
      const riskScore = calculateRiskScore(s);
      const riskLevel = getRiskLevel(riskScore);
      const recommendation = getRiskRecommendation(riskLevel);
      return { ...s, riskScore, riskLevel, recommendation };
    }));
  }, []);

  const assignCounselor = useCallback((studentId: string, counselorId: string, counselorName: string) => {
    setStudents(prev => prev.map(s =>
      s.id === studentId ? { ...s, counselorId, counselorName, counselingStatus: 'pending' as const } : s
    ));
    setNotifications(prev => [...prev, {
      id: Date.now().toString(),
      message: `Counselor ${counselorName} assigned to student`,
      type: 'counseling',
      read: false,
      date: new Date().toISOString(),
      userId: counselorId,
    }]);
  }, []);

  const addCounselingNote = useCallback((note: Omit<CounselingNote, 'id'>) => {
    setNotes(prev => [...prev, { ...note, id: Date.now().toString() }]);
  }, []);

  const updateCounselingStatus = useCallback((studentId: string, status: 'pending' | 'in_progress' | 'resolved') => {
    setStudents(prev => prev.map(s =>
      s.id === studentId ? { ...s, counselingStatus: status } : s
    ));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id'>) => {
    setNotifications(prev => [...prev, { ...n, id: Date.now().toString() }]);
  }, []);

  return (
    <DataContext.Provider value={{
      students, notes, notifications,
      addStudent, addStudents, runPrediction, runAllPredictions,
      assignCounselor, addCounselingNote, updateCounselingStatus,
      markNotificationRead, addNotification,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
