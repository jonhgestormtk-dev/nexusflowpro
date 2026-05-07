'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** 
 * Initiate anonymous sign-in (non-blocking). 
 * Accepts an optional onError callback to handle failures without blocking UI.
 */
export function initiateAnonymousSignIn(authInstance: Auth, onError?: (error: any) => void): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await'.
  signInAnonymously(authInstance).catch(onError);
}

/** 
 * Initiate email/password sign-up (non-blocking). 
 * Accepts an optional onError callback to handle failures.
 */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, onError?: (error: any) => void): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await'.
  createUserWithEmailAndPassword(authInstance, email, password).catch(onError);
}

/** 
 * Initiate email/password sign-in (non-blocking). 
 * Accepts an optional onError callback to handle failures.
 */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, onError?: (error: any) => void): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await'.
  signInWithEmailAndPassword(authInstance, email, password).catch(onError);
}
