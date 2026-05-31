import { useSupabaseContext } from '../context/SupabaseContext';

export function useNotifications() {
  const { notifications, updateItem, insertItem, refreshData, showToast } = useSupabaseContext();
  
  const markAsRead = async (id: string) => {
    try {
      await updateItem('notifications', id, { read: true });
      showToast("Marked as read.", "success");
    } catch (err) {
      showToast("Could not mark as read.", "error");
    }
  };

  const markAllAsRead = async (useFallback: boolean, dataUpdatesFunc?: () => void) => {
    try {
      if (useFallback) {
         if (dataUpdatesFunc) dataUpdatesFunc();
         showToast("All notifications marked as read.", "success");
      } else {
         // This is a direct global update, so in a real app would be an RPC call or service
         // But for now, returning false to indicate fallback should be used remotely if needed
         return false; 
      }
    } catch (err: any) {
      showToast("Failed to mark all read: " + err.message, "error");
    }
    return true;
  };

  return { notifications, markAsRead, markAllAsRead, unreadCount: notifications.filter((n: any) => !n.read).length };
}

export function usePrograms() {
  const { programs } = useSupabaseContext();
  return { programs };
}

export function useAppData() {
  // A clean wrapper just providing specific typed data slices
  const { data, user, refreshData } = useSupabaseContext() as any;
  return { data, user, refreshData };
}
