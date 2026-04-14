import { StateStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

const storage = AsyncStorage

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.setItem(name, JSON.stringify(value))
  },
  getItem: async (name) => {
    const value = await storage.getItem(name)
    return value ? JSON.parse(value) : null
  },
  removeItem: (name) => {
    return storage.removeItem(name)
  },
}
