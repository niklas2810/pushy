"use client";
import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      console.warn('Service Workers or Notifications are not supported');
      return;
    }
    console.log('Registering service worker for push notifications...');

    const register = async () => {
        const registration = await navigator.serviceWorker.register('/sw.js');

        if(registration.installing) {
            console.log('Service worker installing');
        } else if(registration.waiting) {
            console.log('Service worker installed');
        } else if(registration.active) {
            console.log('Service worker active');
        }
    };

    register().catch((err) => console.error('Service Worker registration failed:', err));
  }, []);
  return null;
}