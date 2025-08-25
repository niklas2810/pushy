
"use client";
import { useState, useEffect } from "react";
import { getOrCreateUserId } from "./getOrCreateUserId";
import { TitleWithTooltip } from "./TitleWithTooltip";
import { requestNotificationPermission } from "./register";

export default function Home() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hasSubscription, setHasSubscription] = useState(false);

  // VAPID key fetching removed; service worker now handles push registration

  // On first client-side load, check for userid in localStorage, generate if missing, and log it
  const [userid, setUserId] = useState<string>("");
  useEffect(() => {
    const id = getOrCreateUserId();
    setUserId(id);
    console.log("UserID:", id);
  }, []);

  // On page load, fetch subscription for current UUID
  const [subscriptionInfo, setSubscriptionInfo] = useState<string>("");
  useEffect(() => {
    if (!userid) return;
    fetch(`/api/subscriptions/${userid}`)
      .then(res => res.json())
      .then(data => {
        setSubscriptionInfo(JSON.stringify(data, null, 2));
        if (Object.keys(data).length === 0) {
          console.log("No subscription found for this user.");
          setHasSubscription(false);
        } else if ("minutes" in data) {
          console.log("Subscription found:", data);
          const mins = Number(data.minutes);
          setHours(Math.floor(mins / 60));
          setMinutes(mins % 60);
          setHasSubscription(true);
        }
      })
      .catch(err => {
        console.error("Failed to fetch subscription:", err);
        setHasSubscription(false);
        setSubscriptionInfo("");
      });
  }, [userid]);

  useEffect(() => {
    console.log(`State changed: hours=${hours}, minutes=${minutes}`);
  }, [hours, minutes]);

  const subscribeDisabled = (hours === 24 && minutes !== 0) || (hours === 0 && minutes === 0);
  const unsubscribeDisabled = !hasSubscription;

  // Handle subscribe button click
  const handleSubscribe = async () => {
    const totalMinutes = hours * 60 + minutes;
    if (!('serviceWorker' in navigator)) {
      console.error('Service workers not supported');
      return;
    }
    // Request notification permission before subscribing
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted. Subscription will not proceed.');
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      // Send message to service worker to register subscription
      reg.active?.postMessage({
        action: 'subscribe',
        uuid: userid,
        minutes: totalMinutes
      });
      setHasSubscription(true);
      console.log('Message posted to service worker for subscription registration.');
    } catch (err) {
      console.error('Failed to post message to service worker:', err);
    }
  };

  // Handle unsubscribe button click
  const handleUnsubscribe = async () => {
    if (!userid) return;
    try {
      const res = await fetch(`/api/subscriptions/${userid}`, { method: 'DELETE' });
      if (res.ok) {
        setHasSubscription(false);
        console.log('Unsubscribed successfully.');
      } else {
        const data = await res.json();
        console.error('Failed to unsubscribe:', data.error || res.statusText);
      }
    } catch (err) {
      console.error('Error unsubscribing:', err);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background font-sans">
      <TitleWithTooltip title="Pushy" tooltip={userid ? `User ID: ${userid}` : ""} />
      <div className="flex flex-col items-center gap-8 p-8 rounded-xl shadow-lg bg-white dark:bg-neutral-900">
        <div className="flex gap-8 items-center">
          {/* Hours Picker */}
          <div className="flex flex-col items-center">
            <label htmlFor="hours" className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-200">Hours</label>
            <select
              id="hours"
              value={hours}
              onChange={e => setHours(Number(e.target.value))}
              className="w-24 h-12 text-center text-xl rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[...Array(25).keys()].map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          {/* Minutes Picker */}
          <div className="flex flex-col items-center">
            <label htmlFor="minutes" className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-200">Minutes</label>
            <select
              id="minutes"
              value={minutes}
              onChange={e => setMinutes(Number(e.target.value))}
              className="w-24 h-12 text-center text-xl rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[...Array(60).keys()].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-6 mt-4">
          <button
            className={
              `px-6 py-3 rounded-lg font-semibold shadow transition-colors ` +
              (unsubscribeDisabled
                ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700")
            }
            type="button"
            disabled={unsubscribeDisabled}
            aria-disabled={unsubscribeDisabled}
            onClick={handleUnsubscribe}
          >
            Unsubscribe
          </button>
          <button
            className={
              `px-6 py-3 rounded-lg font-semibold shadow transition-colors ` +
              (subscribeDisabled
                ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700")
            }
            type="button"
            disabled={subscribeDisabled}
            aria-disabled={subscribeDisabled}
            onClick={handleSubscribe}
          >
            Subscribe
          </button>
        </div>
        {/* Output textbox for GET response */}
        <div className="mt-6 w-full">
          <label htmlFor="subscriptionInfo" className="block mb-2 text-md font-medium text-gray-700 dark:text-gray-200">Subscription Info (raw GET response):</label>
          <textarea
            id="subscriptionInfo"
            value={subscriptionInfo}
            readOnly
            rows={8}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-neutral-800 font-mono text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}
