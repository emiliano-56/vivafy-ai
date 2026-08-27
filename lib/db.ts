import { supabase } from './supabase'

export { supabase }

// Auth Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  createdAt: string
}

// Authentication
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  username: string
) {
  try {
    // Step 1: Create auth user with metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username,
        },
      },
    })

    if (error) {
      console.error('[v0] Auth signup error:', error.message)
      throw error
    }

    if (!data || !data.user) {
      console.error('[v0] No user data returned from signup')
      throw new Error('Failed to create user')
    }

    console.log('[v0] User created with ID:', data.user.id)
    console.log('[v0] Profile will be created automatically by trigger')
    console.log('[v0] Confirmation email sent to:', email)
    return data
  } catch (error) {
    console.error('[v0] SignUp error:', error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('[v0] Sign in error:', error.message)
      // Check if error is about email confirmation
      if (error.message?.includes('Email not confirmed')) {
        throw new Error('Please check your email to confirm your account before signing in. If you haven\'t received the confirmation email, check your spam folder.')
      }
      throw error
    }

    // Verify the user's email is confirmed
    if (data.user && !data.user.email_confirmed_at) {
      console.error('[v0] Email not confirmed for user:', email)
      throw new Error('Please check your email to confirm your account before signing in. If you haven\'t received the confirmation email, check your spam folder.')
    }

    console.log('[v0] User signed in successfully:', email)
    return data
  } catch (error) {
    console.error('[v0] SignIn error:', error)
    throw error
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}
