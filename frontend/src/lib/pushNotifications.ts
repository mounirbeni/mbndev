import { notificationAPI } from '@/lib/api';

/** Phone/desktop push support, as the browser reports it right now. */
export function pushSupported() {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;
}

/** True when the site runs as an installed app (Home Screen / PWA window). */
export function isInstalledApp() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export type EnablePushResult = 'enabled' | 'unsupported' | 'denied' | 'not-configured' | 'failed';

/**
 * Ask for permission (must run from a user gesture — iOS requires it),
 * subscribe this device and register the subscription for the signed-in user.
 */
export async function enablePushNotifications(): Promise<EnablePushResult> {
  if (!pushSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return 'denied';
    const { data } = await notificationAPI.pushConfig();
    if (!data.configured || !data.publicKey) return 'not-configured';
    const registration = await navigator.serviceWorker.ready;
    const base64 = data.publicKey.replace(/-/g, '+').replace(/_/g, '/');
    const key = Uint8Array.from(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')),
      (char) => char.charCodeAt(0)
    );
    const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    await notificationAPI.subscribePush(subscription.toJSON());
    return 'enabled';
  } catch {
    return 'failed';
  }
}

export const PUSH_RESULT_MESSAGES: Record<Exclude<EnablePushResult, 'enabled'>, string> = {
  unsupported: 'This browser can’t receive notifications. On iPhone, add MBN DEV to your Home Screen first, then enable them from there.',
  denied: 'Notifications are blocked for this site. Allow them in your browser settings, then try again.',
  'not-configured': 'Phone notifications are not configured on the server yet.',
  failed: 'Could not enable notifications. Please try again.',
};
