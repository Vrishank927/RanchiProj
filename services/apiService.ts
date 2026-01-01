
import { ScanResult, HistoryItem } from '../types';
import { geminiService } from './geminiService';

/**
 * apiService manages the application data lifecycle.
 * Refactored to eliminate 'Failed to fetch' errors by moving logic 
 * to the client-side, utilizing Gemini AI directly and LocalStorage 
 * for persistence in this environment.
 */

const STORAGE_KEY = 'safebrowse_history_v2';

export const apiService = {
  /**
   * Performs a security scan using the Gemini AI service.
   * Results are persisted locally to avoid network fetch errors to localhost.
   */
  async scanContent(content: string): Promise<ScanResult> {
    try {
      // 1. Call AI service directly
      const result = await geminiService.scanContent(content);
      
      // 2. Prepare history item
      const historyItem: HistoryItem = {
        ...result,
        id: crypto.randomUUID(),
        contentSnippet: content.slice(0, 500) + (content.length > 500 ? '...' : ''),
        timestamp: new Date().toISOString()
      };

      // 3. Persist to LocalStorage
      const history = await this.getHistory();
      const updatedHistory = [historyItem, ...history].slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

      return result;
    } catch (error: any) {
      console.error('Scan Operation Failed:', error);
      throw new Error(error.message || "The AI protection engine failed to process the request.");
    }
  },

  /**
   * Fetches the latest safety incidents from LocalStorage.
   */
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Local Storage Retrieval Error:', error);
      return [];
    }
  },

  /**
   * Clears all logs from local persistence.
   */
  async clearHistory(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('LocalStorage Purge Error:', error);
      throw new Error("Failed to clear history.");
    }
  }
};
