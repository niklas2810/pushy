"use client";
import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      console.warn('Service Workers or Notifications are not supported');
      return;
    }
    console.log('Registering service worker for push notifications...');
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          console.log('Service worker registered successfully.');
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
    });
  }, []);
  return null;
}