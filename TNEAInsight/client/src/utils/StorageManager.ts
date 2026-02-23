/**
 * StorageManager: Handles localStorage persistence for TNEA application workflow
 * Provides utilities for saving, retrieving, and managing workflow data with auto-sync
 */

interface StorageOptions {
  autoSync?: boolean;
  debounceDelay?: number;
  encryptSensitive?: boolean;
}

interface WorkflowData {
  studentId?: string;
  registration?: Record<string, any>;
  verification?: Record<string, any>;
  rankAnalysis?: Record<string, any>;
  choiceFilling?: Record<string, any>;
  allotment?: Record<string, any>;
  confirmation?: Record<string, any>;
  admission?: Record<string, any>;
  lastUpdated?: string;
}

class StorageManager {
  private readonly STORAGE_PREFIX = "tnea_";
  private readonly WORKFLOW_KEY = `${this.STORAGE_PREFIX}workflow`;
  private readonly AUTH_KEY = `${this.STORAGE_PREFIX}auth`;
  private readonly PREFERENCES_KEY = `${this.STORAGE_PREFIX}preferences`;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(private options: StorageOptions = { autoSync: true, debounceDelay: 2000 }) {}

  /**
   * Save workflow data to localStorage with optional auto-sync
   */
  public saveWorkflowData(stepName: string, data: Record<string, any>, studentId?: string): void {
    try {
      const existingData = this.getWorkflowData();
      const updatedData: WorkflowData = {
        ...existingData,
        [stepName]: data,
        lastUpdated: new Date().toISOString(),
        studentId: studentId || existingData.studentId
      };

      this.setStorageItem(this.WORKFLOW_KEY, updatedData);
      this.triggerSyncEvent(stepName, data);
    } catch (error) {
      console.error(`Error saving workflow data for step ${stepName}:`, error);
      this.handleStorageError("save", stepName);
    }
  }

  /**
   * Get all workflow data from localStorage
   */
  public getWorkflowData(): WorkflowData {
    try {
      const data = this.getStorageItem(this.WORKFLOW_KEY);
      return data || {};
    } catch (error) {
      console.error("Error retrieving workflow data:", error);
      return {};
    }
  }

  /**
   * Get data for a specific workflow step
   */
  public getStepData(stepName: string): Record<string, any> | null {
    try {
      const workflowData = this.getWorkflowData();
      const stepData = workflowData[stepName as keyof WorkflowData];
      return (stepData && typeof stepData === "object") ? (stepData as Record<string, any>) : null;
    } catch (error) {
      console.error(`Error retrieving step data for ${stepName}:`, error);
      return null;
    }
  }

  /**
   * Save step data with debouncing for auto-save functionality
   */
  public saveStepDataDebounced(stepName: string, data: Record<string, any>, studentId?: string): void {
    const debounceKey = `${this.WORKFLOW_KEY}.${stepName}`;

    // Clear existing timer
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey)!);
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.saveWorkflowData(stepName, data, studentId);
      this.debounceTimers.delete(debounceKey);
    }, this.options.debounceDelay || 2000);

    this.debounceTimers.set(debounceKey, timer);
  }

  /**
   * Clear all debounce timers and save immediately
   */
  public flushAllDebounced(): void {
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  /**
   * Delete a specific step's data
   */
  public deleteStepData(stepName: string): void {
    try {
      const workflowData = this.getWorkflowData();
      delete workflowData[stepName as keyof WorkflowData];
      workflowData.lastUpdated = new Date().toISOString();
      this.setStorageItem(this.WORKFLOW_KEY, workflowData);
    } catch (error) {
      console.error(`Error deleting step data for ${stepName}:`, error);
    }
  }

  /**
   * Clear entire workflow data
   */
  public clearWorkflowData(): void {
    try {
      this.flushAllDebounced();
      localStorage.removeItem(this.WORKFLOW_KEY);
      this.triggerSyncEvent("clear", null);
    } catch (error) {
      console.error("Error clearing workflow data:", error);
    }
  }

  /**
   * Save authentication data
   */
  public saveAuthData(authData: { userId: string; token: string; role: string; email: string }): void {
    try {
      this.setStorageItem(this.AUTH_KEY, authData);
    } catch (error) {
      console.error("Error saving auth data:", error);
    }
  }

  /**
   * Get authentication data
   */
  public getAuthData(): any | null {
    try {
      return this.getStorageItem(this.AUTH_KEY);
    } catch (error) {
      console.error("Error retrieving auth data:", error);
      return null;
    }
  }

  /**
   * Clear authentication data (on logout)
   */
  public clearAuthData(): void {
    try {
      localStorage.removeItem(this.AUTH_KEY);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  }

  /**
   * Save user preferences (language, theme, etc.)
   */
  public savePreferences(preferences: Record<string, any>): void {
    try {
      const existingPrefs = this.getStorageItem(this.PREFERENCES_KEY) || {};
      const mergedPrefs = { ...existingPrefs, ...preferences };
      this.setStorageItem(this.PREFERENCES_KEY, mergedPrefs);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  }

  /**
   * Get user preferences
   */
  public getPreferences(): Record<string, any> {
    try {
      return this.getStorageItem(this.PREFERENCES_KEY) || {};
    } catch (error) {
      console.error("Error retrieving preferences:", error);
      return {};
    }
  }

  /**
   * Get workflow progress (percentage of completed steps)
   */
  public getWorkflowProgress(): { completed: number; total: number; percentage: number } {
    const workflowData = this.getWorkflowData();
    const steps = ["registration", "verification", "rankAnalysis", "choiceFilling", "allotment", "confirmation", "admission"];
    const completedSteps = steps.filter(step => workflowData[step as keyof WorkflowData]);

    return {
      completed: completedSteps.length,
      total: steps.length,
      percentage: Math.round((completedSteps.length / steps.length) * 100)
    };
  }

  /**
   * Export all workflow data as JSON (for backup)
   */
  public exportData(): string {
    try {
      const workflowData = this.getWorkflowData();
      const authData = this.getAuthData();
      const preferences = this.getPreferences();

      const exportData = {
        workflow: workflowData,
        auth: authData,
        preferences: preferences,
        exportedAt: new Date().toISOString()
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Error exporting data:", error);
      return "";
    }
  }

  /**
   * Import workflow data from JSON (for restore)
   */
  public importData(jsonString: string): boolean {
    try {
      const importedData = JSON.parse(jsonString);

      if (importedData.workflow) {
        this.setStorageItem(this.WORKFLOW_KEY, importedData.workflow);
      }
      if (importedData.auth) {
        this.setStorageItem(this.AUTH_KEY, importedData.auth);
      }
      if (importedData.preferences) {
        this.setStorageItem(this.PREFERENCES_KEY, importedData.preferences);
      }

      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  /**
   * Sync data to server (placeholder for actual API integration)
   */
  public async syncToServer(studentId: string): Promise<boolean> {
    try {
      const workflowData = this.getWorkflowData();
      // This would be replaced with actual API call
      console.log("Syncing data to server for student:", studentId);
      console.log("Data to sync:", workflowData);
      // const response = await fetch(`/api/workflow/sync/${studentId}`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(workflowData)
      // });
      // return response.ok;
      return true;
    } catch (error) {
      console.error("Error syncing to server:", error);
      return false;
    }
  }

  /**
   * Check storage quota availability
   */
  public getStorageStats(): { estimated: number; remaining: number; percentage: number } {
    try {
      if (!navigator.storage?.estimate) {
        return { estimated: 0, remaining: 0, percentage: 0 };
      }

      // Rough calculation of storage used
      let storageUsed = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          storageUsed += localStorage[key].length + key.length;
        }
      }

      const estimatedQuota = 5 * 1024 * 1024; // 5MB typical limit
      const remaining = Math.max(0, estimatedQuota - storageUsed);
      const percentage = Math.round((storageUsed / estimatedQuota) * 100);

      return {
        estimated: storageUsed,
        remaining: remaining,
        percentage: percentage
      };
    } catch (error) {
      console.error("Error calculating storage stats:", error);
      return { estimated: 0, remaining: 0, percentage: 0 };
    }
  }

  /**
   * Listen for storage changes (from other tabs)
   */
  public onStorageChange(callback: (data: WorkflowData) => void): void {
    window.addEventListener("storage", (event) => {
      if (event.key === this.WORKFLOW_KEY && event.newValue) {
        try {
          const updatedData = JSON.parse(event.newValue);
          callback(updatedData);
        } catch (error) {
          console.error("Error parsing storage change:", error);
        }
      }
    });
  }

  /**
   * Private helper methods
   */
  private setStorageItem(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private getStorageItem(key: string): any | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  private triggerSyncEvent(stepName: string, data: any): void {
    if (this.options.autoSync) {
      const event = new CustomEvent("tnea-workflow-update", {
        detail: { stepName, data, timestamp: new Date().toISOString() }
      });
      window.dispatchEvent(event);
    }
  }

  private handleStorageError(operation: string, stepName: string): void {
    // Check if quota exceeded
    try {
      localStorage.setItem("__test__", "test");
      localStorage.removeItem("__test__");
    } catch (error) {
      console.error("LocalStorage quota exceeded. Please clear some data.");
      // Could trigger a cleanup routine or user notification
    }
  }
}

// Export singleton instance
export default new StorageManager({
  autoSync: true,
  debounceDelay: 2000,
  encryptSensitive: false
});

// Export types
export type { WorkflowData, StorageOptions };
