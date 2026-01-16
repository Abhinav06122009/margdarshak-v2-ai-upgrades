// src/lib/dashboardUtils.ts

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; 

/**
 * Updates a task's status
 */
export const handleTaskStatusUpdate = async (taskId: string, newStatus: 'pending' | 'completed' | 'in_progress') => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating task:", error);
    return false;
  }
};

/**
 * Creates a quick task
 */
export const handleCreateQuickTask = async (userId: string, title: string, priority: 'high' | 'medium' | 'low') => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ 
        user_id: userId, 
        title, 
        priority, 
        status: 'pending',
        is_deleted: false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating task:", error);
    return null;
  }
};

/**
 * ✅ NEW: Deletes a single task (Soft Delete)
 */
export const handleDeleteTask = async (taskId: string) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ is_deleted: true }) 
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    return false;
  }
};

/**
 * ✅ NEW: Bulk Deletes tasks
 */
export const handleBulkDeleteTasks = async (taskIds: string[]) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ is_deleted: true })
      .in('id', taskIds);

    if (error) throw error;
    toast.success(`${taskIds.length} tasks deleted`);
    return true;
  } catch (error) {
    console.error("Error bulk deleting tasks:", error);
    toast.error("Failed to delete tasks");
    return false;
  }
};

/**
 * Exports dashboard data to JSON
 */
export const handleExportData = (tasks: any[], stats: any, analytics: any) => {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const dataToExport = {
      meta: {
        exportedAt: new Date().toISOString(),
        platform: "Margdarshak AI",
        version: "1.0"
      },
      stats,
      analytics,
      tasks: tasks || []
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `margdarshak_data_${timestamp}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Dashboard data exported successfully");
    return true;
  } catch (error) {
    console.error("Export failed:", error);
    toast.error("Failed to export data");
    return false;
  }
};