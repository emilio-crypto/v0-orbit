// Demo authentication system using localStorage for when Supabase is not configured
export interface DemoUser {
  id: string
  email: string
  display_name: string
  is_anonymous: boolean
  created_at: string
}

export interface DemoSettings {
  id: string
  display_name: string
  preferred_language: string
  translation_target_language: string
  enable_auto_translation: boolean
  enable_auto_captions: boolean
}

const DEMO_USER_KEY = "orbit_demo_user"
const DEMO_SETTINGS_KEY = "orbit_demo_settings"

export function getDemoUser(): DemoUser | null {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem(DEMO_USER_KEY)
  return user ? JSON.parse(user) : null
}

export function setDemoUser(user: DemoUser) {
  if (typeof window === "undefined") return
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
}

export function clearDemoUser() {
  if (typeof window === "undefined") return
  localStorage.removeItem(DEMO_USER_KEY)
  localStorage.removeItem(DEMO_SETTINGS_KEY)
}

export function getDemoSettings(): DemoSettings | null {
  if (typeof window === "undefined") return null
  const settings = localStorage.getItem(DEMO_SETTINGS_KEY)
  return settings ? JSON.parse(settings) : null
}

export function setDemoSettings(settings: DemoSettings) {
  if (typeof window === "undefined") return
  localStorage.setItem(DEMO_SETTINGS_KEY, JSON.stringify(settings))
}

export function createDemoUser(email: string, password: string, displayName?: string): DemoUser {
  const user: DemoUser = {
    id: `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    email,
    display_name: displayName || email.split("@")[0],
    is_anonymous: false,
    created_at: new Date().toISOString(),
  }
  setDemoUser(user)

  // Create default settings
  const settings: DemoSettings = {
    id: user.id,
    display_name: user.display_name,
    preferred_language: "en",
    translation_target_language: "es",
    enable_auto_translation: false,
    enable_auto_captions: false,
  }
  setDemoSettings(settings)

  return user
}

export function createGuestUser(): DemoUser {
  const user: DemoUser = {
    id: `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    email: "guest@orbit.local",
    display_name: `Guest ${Math.floor(Math.random() * 1000)}`,
    is_anonymous: true,
    created_at: new Date().toISOString(),
  }
  setDemoUser(user)

  // Create default settings
  const settings: DemoSettings = {
    id: user.id,
    display_name: user.display_name,
    preferred_language: "en",
    translation_target_language: "es",
    enable_auto_translation: false,
    enable_auto_captions: false,
  }
  setDemoSettings(settings)

  return user
}

export function loginDemoUser(email: string, password: string): DemoUser | null {
  // In demo mode, any credentials work
  return createDemoUser(email, password)
}
