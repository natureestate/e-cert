import { AppState } from '../types/certificate';

const STORAGE_KEY = 'warrantyAppState';

/**
 * บันทึกสถานะแอปลง LocalStorage
 * @param state สถานะแอปที่ต้องการบันทึก
 */
export const saveAppState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save state to localStorage", error);
  }
};

/**
 * โหลดสถานะแอปจาก LocalStorage
 * @returns สถานะแอปที่บันทึกไว้ หรือ null หากไม่มีข้อมูล
 */
export const loadAppState = (): AppState | null => {
  try {
    const savedStateJSON = localStorage.getItem(STORAGE_KEY);
    if (savedStateJSON) {
      return JSON.parse(savedStateJSON);
    }
    return null;
  } catch (error) {
    console.error("Failed to load or parse state from localStorage", error);
    return null;
  }
};

/**
 * ลบสถานะแอปจาก LocalStorage
 */
export const clearAppState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear state from localStorage", error);
  }
};
