import { Bell, UserPlus, AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AdminNotification } from '@/hooks/useAdminNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

interface AdminNotificationBellProps {
  notifications: AdminNotification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}

export function AdminNotificationBell({ notifications, unreadCount, onMarkAllRead, onDismiss }: AdminNotificationBellProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notificări Admin</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onMarkAllRead}>
              <Check className="h-3 w-3 mr-1" />
              Marchează citite
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">Nicio notificare</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors group",
                    !notif.read && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                    notif.type === 'new_user' ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                  )}>
                    {notif.type === 'new_user' ? (
                      <UserPlus className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true, locale: ro })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={() => onDismiss(notif.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
