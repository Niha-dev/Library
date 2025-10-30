import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";

export function NotificationBar() {
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest('PUT', `/api/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const unreadNotifications = notifications?.filter(n => !n.read) || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return Info;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400';
      case 'error': return 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400';
      default: return 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400';
    }
  };

  if (unreadNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-40 px-4">
      <AnimatePresence>
        {unreadNotifications.slice(0, 3).map((notification) => {
          const Icon = getIcon(notification.type);
          const colorClass = getColorClass(notification.type);

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-2"
            >
              <div className={`max-w-4xl mx-auto rounded-lg border p-4 ${colorClass} backdrop-blur-sm`}>
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="flex-1 text-sm font-medium">
                    {notification.message}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mr-2"
                    onClick={() => markAsReadMutation.mutate(notification.id)}
                    data-testid={`button-dismiss-notification-${notification.id}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
