/**
 * Device Session Registry
 * Manages device session records for multi-device tracking
 *
 * Phase M8: Snapshot generation management
 */

import type { DeviceSessionRecord } from './types'

/**
 * Storage key for device session registry
 */
const DEVICE_REGISTRY_KEY = 'nodeaiz:crystal:device-registry'

/**
 * Generate a device ID
 * Uses localStorage to persist device identity across sessions
 */
const getOrCreateDeviceId = (): string => {
  const DEVICE_ID_KEY = 'nodeaiz:device-id'

  let deviceId = localStorage.getItem(DEVICE_ID_KEY)

  if (!deviceId) {
    // Generate new device ID
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }

  return deviceId
}

/**
 * Get device label
 * Returns a human-readable label for this device
 */
const getDeviceLabel = (): string => {
  // Simple heuristic based on user agent
  const ua = navigator.userAgent

  if (ua.includes('Mobile')) {
    return 'Mobile Device'
  } else if (ua.includes('Tablet')) {
    return 'Tablet'
  } else {
    return 'Desktop'
  }
}

/**
 * Register or update device session
 * Records that this device has accessed/saved the session
 */
export const registerDeviceSession = (record: Partial<DeviceSessionRecord> & {
  sessionId: string
  turnCount: number
  updatedAt: number
}): boolean => {
  try {
    const deviceId = getOrCreateDeviceId()
    const deviceLabel = getDeviceLabel()

    const fullRecord: DeviceSessionRecord = {
      deviceId,
      deviceLabel,
      lastSeenAt: Date.now(),
      lastSavedAt: record.lastSavedAt ?? Date.now(),
      ...record,
    }

    // Load existing registry
    const registry = loadRegistry()

    // Update or add record
    const key = `${record.sessionId}:${deviceId}`
    registry.set(key, fullRecord)

    // Save registry
    saveRegistry(registry)

    return true
  } catch (error) {
    console.warn('Failed to register device session:', error)
    return false
  }
}

/**
 * List device sessions for a specific session ID
 * Returns all devices that have accessed this session
 */
export const listDeviceSessions = (sessionId: string): DeviceSessionRecord[] => {
  try {
    const registry = loadRegistry()
    const records: DeviceSessionRecord[] = []

    for (const [key, record] of registry.entries()) {
      if (record.sessionId === sessionId) {
        records.push(record)
      }
    }

    // Sort by last seen (most recent first)
    records.sort((a, b) => b.lastSeenAt - a.lastSeenAt)

    return records
  } catch (error) {
    console.warn('Failed to list device sessions:', error)
    return []
  }
}

/**
 * Update device session record
 * Updates an existing device session with new information
 */
export const updateDeviceSession = (record: DeviceSessionRecord): boolean => {
  try {
    const registry = loadRegistry()
    const key = `${record.sessionId}:${record.deviceId}`

    registry.set(key, {
      ...record,
      lastSeenAt: Date.now(),
    })

    saveRegistry(registry)
    return true
  } catch (error) {
    console.warn('Failed to update device session:', error)
    return false
  }
}

/**
 * Get the most recent device session for a session
 */
export const getMostRecentDeviceSession = (
  sessionId: string
): DeviceSessionRecord | undefined => {
  const sessions = listDeviceSessions(sessionId)

  if (sessions.length === 0) {
    return undefined
  }

  // Already sorted by lastSeenAt descending
  return sessions[0]
}

/**
 * Get this device's session record for a session
 */
export const getThisDeviceSession = (
  sessionId: string
): DeviceSessionRecord | undefined => {
  const deviceId = getOrCreateDeviceId()
  const sessions = listDeviceSessions(sessionId)

  return sessions.find(s => s.deviceId === deviceId)
}

/**
 * Check if this is the primary device for a session
 * Primary device is the one that saved most recently
 */
export const isThisDevicePrimary = (sessionId: string): boolean => {
  const mostRecent = getMostRecentDeviceSession(sessionId)

  if (!mostRecent) {
    return true // No other devices, so this is primary
  }

  const deviceId = getOrCreateDeviceId()
  return mostRecent.deviceId === deviceId
}

/**
 * Get device session summary
 * Returns overview of multi-device access for a session
 */
export const getDeviceSessionSummary = (sessionId: string): {
  totalDevices: number
  primaryDevice: DeviceSessionRecord | undefined
  thisDevice: DeviceSessionRecord | undefined
  isThisPrimary: boolean
  devices: DeviceSessionRecord[]
} => {
  const devices = listDeviceSessions(sessionId)
  const primaryDevice = getMostRecentDeviceSession(sessionId)
  const thisDevice = getThisDeviceSession(sessionId)
  const isThisPrimary = isThisDevicePrimary(sessionId)

  return {
    totalDevices: devices.length,
    primaryDevice,
    thisDevice,
    isThisPrimary,
    devices,
  }
}

/**
 * Prune old device session records
 * Removes records older than specified age
 */
export const pruneOldDeviceSessions = (maxAge: number = 30 * 24 * 60 * 60 * 1000): number => {
  try {
    const registry = loadRegistry()
    const now = Date.now()
    let pruned = 0

    for (const [key, record] of registry.entries()) {
      if (now - record.lastSeenAt > maxAge) {
        registry.delete(key)
        pruned++
      }
    }

    saveRegistry(registry)
    return pruned
  } catch (error) {
    console.warn('Failed to prune old device sessions:', error)
    return 0
  }
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Load device registry from localStorage
 */
const loadRegistry = (): Map<string, DeviceSessionRecord> => {
  try {
    const stored = localStorage.getItem(DEVICE_REGISTRY_KEY)

    if (!stored) {
      return new Map()
    }

    const records: [string, DeviceSessionRecord][] = JSON.parse(stored)
    return new Map(records)
  } catch (error) {
    console.warn('Failed to load device registry:', error)
    return new Map()
  }
}

/**
 * Save device registry to localStorage
 */
const saveRegistry = (registry: Map<string, DeviceSessionRecord>): void => {
  try {
    const records = Array.from(registry.entries())
    localStorage.setItem(DEVICE_REGISTRY_KEY, JSON.stringify(records))
  } catch (error) {
    console.warn('Failed to save device registry:', error)
  }
}
