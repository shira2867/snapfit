"use client";
import { useEffect, useState } from "react";
import styles from "./WeatherWidget.module.css";

export default function WeatherWidget() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://weatherwidget.io/js/widget.min.js";
    script.async = true;

    script.onload = () => {
      setLoaded(true);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className={`${styles.weatherContainer} ${
        loaded ? styles.visible : styles.hidden
      }`}
    >
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
}
