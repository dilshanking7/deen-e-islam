"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Compass, Navigation, MapPin, AlertCircle, RotateCw } from "lucide-react";

// Makkah Kaaba Coordinates
const MAKKAH_LAT = 21.422487;
const MAKKAH_LNG = 39.826206;

type DeviceOrientationConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>;
};

type WebkitDeviceOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

export default function QiblaFinder() {
  const [heading, setHeading] = useState<number>(0); // Device facing angle
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null); // Qibla angle from user location
  const [distance, setDistance] = useState<number | null>(null); // Distance to Makkah in km
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  // Calculate Qibla Bearing (Degree) using Spherical Trigonometry Formula
  const calculateQibla = useCallback((lat: number, lng: number) => {
    const phi1 = (lat * Math.PI) / 180;
    const phi2 = (MAKKAH_LAT * Math.PI) / 180;
    const lam1 = (lng * Math.PI) / 180;
    const lam2 = (MAKKAH_LNG * Math.PI) / 180;

    const y = Math.sin(lam2 - lam1);
    const x =
      Math.cos(phi1) * Math.tan(phi2) -
      Math.sin(phi1) * Math.cos(lam2 - lam1);

    let qibla = (Math.atan2(y, x) * 180) / Math.PI;
    qibla = (qibla + 360) % 360;

    setQiblaBearing(qibla);

    // Calculate Haversine Distance
    const R = 6371; // Earth radius in KM
    const dLat = phi2 - phi1;
    const dLng = lam2 - lam1;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setDistance(Math.round(R * c));
  }, []);

  // Get User GPS Location
  const getLocation = useCallback(() => {
    setError(null);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          calculateQibla(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setError("GPS access denied. Please allow location access to find Qibla.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, [calculateQibla]);

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let compassHeading = 0;

    // iOS devices
    const webkitHeading = (e as WebkitDeviceOrientationEvent).webkitCompassHeading;
    if (webkitHeading) {
      compassHeading = webkitHeading;
    } else if (e.alpha !== null) {
      // Android devices (absolute heading offset)
      compassHeading = 360 - e.alpha;
    }

    setHeading(compassHeading);
  }, []);

  // Setup Device Orientation (Compass Listener)
  const startCompass = useCallback(async () => {
    if (typeof window === "undefined") return;

    const DOE = DeviceOrientationEvent as DeviceOrientationConstructor;

    // iOS 13+ Device Orientation Permission Request
    if (typeof DOE !== "undefined" && typeof DOE.requestPermission === "function") {
      try {
        const response = await DOE.requestPermission();
        if (response === "granted") {
          setPermissionGranted(true);
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          setError("Compass permission was denied.");
        }
      } catch (e) {
        console.error(e);
      }
    } else if ("DeviceOrientationEvent" in window) {
      setPermissionGranted(true);
      window.addEventListener("deviceorientationabsolute", handleOrientation, true);
      window.addEventListener("deviceorientation", handleOrientation, true);
    } else {
      setError("Device Orientation sensor is not supported on this device.");
    }
  }, [handleOrientation]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      getLocation();
      startCompass();
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("deviceorientationabsolute", handleOrientation);
    };
  }, [getLocation, startCompass, handleOrientation]);

  // Check if phone is aligned with Qibla (tolerance of ±5 degrees)
  const isAligned =
    qiblaBearing !== null &&
    Math.abs(((heading - qiblaBearing + 540) % 360) - 180) < 5;

  // Vibrate when aligned
  useEffect(() => {
    if (isAligned && navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, [isAligned]);

  // Pointer rotation relative to device heading
  const needleRotation = qiblaBearing !== null ? (qiblaBearing - heading + 360) % 360 : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-emerald-50 p-4 sm:p-8 font-sans flex flex-col justify-between items-center">
      <div className="mx-auto max-w-md w-full space-y-6 text-center">
        
        {/* Header */}
        <header className="border-b border-emerald-800/40 pb-4 space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-200 bg-clip-text text-transparent">
            قبلہ نما (Qibla Compass)
          </h1>
          <p className="text-xs text-emerald-400/70">
            Find the exact direction of Kaaba for Namaz
          </p>
        </header>

        {/* Location & Status Info */}
        {qiblaBearing !== null ? (
          <div className="flex justify-around items-center rounded-2xl bg-emerald-950/40 border border-emerald-800/40 p-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Navigation size={14} />
              <span>Qibla Angle: {Math.round(qiblaBearing)}°</span>
            </div>
            {distance && (
              <div className="flex items-center gap-1.5 text-emerald-300">
                <MapPin size={14} />
                <span>Makkah: {distance.toLocaleString()} km</span>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={getLocation}
            className="w-full py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-700/40 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-emerald-800/50 transition"
          >
            <RotateCw size={14} className="animate-spin" /> Location Detect Ho Rahi Hai...
          </button>
        )}

        {/* Alignment Banner Indicator */}
        <div
          className={`py-2 px-4 rounded-full border text-xs font-bold transition-all duration-300 inline-flex items-center gap-2 ${
            isAligned
              ? "bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              : "bg-slate-900 border-slate-800 text-slate-400"
          }`}
        >
          {isAligned ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Aap Bilkul Sahi Kibla Rukh Par Hain! (Face Qibla)</span>
            </>
          ) : (
            <span>Phone Ko Ghumayein Jab Tak Arrow Upar Na Aaye</span>
          )}
        </div>

        {/* Main Interactive Compass Dial */}
        <div className="relative my-6 mx-auto w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          
          {/* Compass Outer Ring */}
          <div
            className={`w-full h-full rounded-full border-8 transition-colors duration-500 relative flex items-center justify-center shadow-2xl ${
              isAligned
                ? "border-emerald-400 bg-emerald-950/20"
                : "border-slate-800 bg-slate-900/60"
            }`}
          >
            {/* Cardinal Points (N, E, S, W) Rotated with Heading */}
            <div
              className="absolute inset-0 rounded-full transition-transform duration-200 ease-out flex items-center justify-center"
              style={{ transform: `rotate(${-heading}deg)` }}
            >
              <span className="absolute top-3 font-bold text-xs text-red-400">N</span>
              <span className="absolute right-4 font-bold text-xs text-slate-400">E</span>
              <span className="absolute bottom-3 font-bold text-xs text-slate-400">S</span>
              <span className="absolute left-4 font-bold text-xs text-slate-400">W</span>
            </div>

            {/* Qibla Direction Needle */}
            {qiblaBearing !== null && (
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out"
                style={{ transform: `rotate(${needleRotation}deg)` }}
              >
                {/* Kaaba Arrow Indicator */}
                <div className="flex flex-col items-center -translate-y-20 sm:-translate-y-24">
                  {/* Kaaba Icon Box */}
                  <div className="w-10 h-10 rounded-lg bg-black border-2 border-amber-400 flex items-center justify-center shadow-lg relative">
                    <div className="w-full h-1 bg-amber-400 absolute top-2" />
                    <span className="text-[10px] text-amber-300 font-bold mt-2">کعبة</span>
                  </div>
                  {/* Arrow Pointing Up */}
                  <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-emerald-400 mt-1" />
                </div>
              </div>
            )}

            {/* Center Dial Hub */}
            <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-emerald-500/50 flex items-center justify-center z-10 shadow-inner">
              <Compass className={`w-6 h-6 ${isAligned ? "text-emerald-400 animate-spin" : "text-emerald-300/60"}`} />
            </div>
          </div>
        </div>

        {/* Permission / Sensor Error Display */}
        {error && (
          <div className="p-3 rounded-2xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sensor Permission Enable Button for iOS/Safari */}
        {!permissionGranted && (
          <button
            onClick={startCompass}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-lg"
          >
            Enable Compass Sensors (کومپاس سینسر آن کریں)
          </button>
        )}

        {/* Guidance Note */}
        <p className="text-[11px] text-slate-400 leading-relaxed font-serif">
          💡 **Note:** Sahi Kibla Rukh ke liye phone ko kisi flat surface (jaise zameen ya table) par rakhein aur kisi magnets ya metal cheezon se door rakhein.
        </p>

      </div>
    </main>
  );
}