"use client";

import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "./WeatherWidget.module.css";

const loadWeatherScript = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-weather-widget]');
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://weatherwidget.io/js/widget.min.js";
    script.async = true;
    script.setAttribute("data-weather-widget", "israel"); 

    script.onload = () => resolve(true); 
    script.onerror = () => reject(new Error("Failed to load weather script"));

    document.body.appendChild(script);
  });
};

const WeatherWidget: FC = () => {
  const [city, setCity] = useState("israel");

  const { data: loaded, isLoading, isError } = useQuery({
    queryKey: ["weatherScript", city],
    queryFn: loadWeatherScript,
    staleTime: Infinity,
  });

  if (isLoading) return <div className={styles.weatherContainer}>Loading...</div>;
  if (isError) return <div className={styles.weatherContainer}>Failed to load widget</div>;

  return (
    <div className={styles.weatherContainer}>
      {loaded && (
        <a
          className="weatherwidget-io"
          href="https://forecast7.com/he/31d0534d85/israel/"
          data-label_1="ISRAEL"
          data-label_2="WEATHER"
          data-theme="original"
        >
          ISRAEL WEATHER
        </a>
      )}
    </div>
  );
};

export default WeatherWidget;
