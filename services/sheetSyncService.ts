
import { Transaction, BudgetMap, CategoryColorMap } from '../types';

interface SyncData {
  transactions: Transaction[];
  budgets: BudgetMap;
  colors: CategoryColorMap;
}

export const uploadToSheet = async (scriptUrl: string, data: SyncData): Promise<boolean> => {
  try {
    // We send as text/plain to avoid CORS preflight complex issues with Google Apps Script
    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'upload',
        data: data
      })
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    const result = await response.json();
    return result.status === 'success';
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

export const downloadFromSheet = async (scriptUrl: string): Promise<SyncData | null> => {
  try {
    const response = await fetch(`${scriptUrl}?action=download`, {
      method: 'GET',
      mode: 'cors'
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    const result = await response.json();
    
    if (result.status === 'success' && result.data) {
      return result.data as SyncData;
    }
    return null;
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
};
