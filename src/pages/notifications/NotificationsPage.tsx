import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Bell, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, markNotificationRead } = useData();
  const userNotifications = notifications.filter(n => n.userId === user?.id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold font-display text-foreground">Notifications</h1>
      {userNotifications.length > 0 ? (
        <div className="space-y-2">
          {userNotifications.map(n => (
            <div key={n.id} className={`stat-card flex items-start gap-3 ${!n.read ? 'border-primary/30' : ''}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                n.type === 'risk' ? 'bg-risk-high/10' : n.type === 'counseling' ? 'bg-primary/10' : 'bg-accent/10'
              }`}>
                <Bell className={`h-4 w-4 ${
                  n.type === 'risk' ? 'text-risk-high' : n.type === 'counseling' ? 'text-primary' : 'text-accent'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.date).toLocaleDateString()}</p>
              </div>
              {!n.read && (
                <Button variant="ghost" size="sm" className="text-xs h-7 shrink-0" onClick={() => markNotificationRead(n.id)}>
                  <CheckCircle className="h-3 w-3 mr-1" /> Mark read
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="stat-card py-12 text-center">
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      )}
    </div>
  );
}
