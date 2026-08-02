import React, { useEffect, useRef, useState } from "react";
import { useWeather } from "../context/WeatherContext";

export type WeatherType = "sunny" | "rain" | "snow" | "thunder" | "fog" | "default";

const normalizeWeather = (condition: string | null): WeatherType => {
  if (!condition) return "default";
  const cond = condition.toLowerCase();
  if (cond.includes("thunder") || cond.includes("lightning") || cond.includes("storm")) return "thunder";
  if (cond.includes("snow") || cond.includes("blizzard") || cond.includes("flurry") || cond.includes("ice")) return "snow";
  if (cond.includes("rain") || cond.includes("drizzle") || cond.includes("shower")) return "rain";
  if (cond.includes("fog") || cond.includes("mist") || cond.includes("haze") || cond.includes("smoke")) return "fog";
  if (cond.includes("clear") || cond.includes("sun") || cond.includes("cloud")) return "sunny";
  return "default";
};

interface WeatherCanvasProps {
  type: WeatherType;
  isActive: boolean;
}

const SingleWeatherCanvas: React.FC<WeatherCanvasProps> = ({ type, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.width;
    const h = () => canvas.height;

    // Particle initialization based on weather type
    // SUNNY particles (clouds + light specks)
    const sunClouds = Array.from({ length: 6 }, () => ({
      x: Math.random() * w(),
      y: Math.random() * (h() * 0.4),
      r: Math.random() * 80 + 60,
      speed: Math.random() * 0.3 + 0.1,
      alpha: Math.random() * 0.12 + 0.08,
    }));
    const sunSpecks = Array.from({ length: 30 }, () => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      r: Math.random() * 2 + 1,
      vy: -(Math.random() * 0.4 + 0.1),
      alpha: Math.random() * 0.5 + 0.2,
    }));

    // RAIN particles
    const rainDrops = Array.from({ length: 180 }, () => ({
      x: Math.random() * (w() + 200) - 100,
      y: Math.random() * h(),
      len: Math.random() * 25 + 15,
      vy: Math.random() * 12 + 14,
      vx: -1.5,
      alpha: Math.random() * 0.4 + 0.3,
    }));
    const splashes: Array<{ x: number; y: number; r: number; alpha: number }> = [];

    // SNOW particles
    const snowFlakes = Array.from({ length: 120 }, () => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      r: Math.random() * 3 + 1,
      vy: Math.random() * 1.5 + 0.8,
      phase: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.02 + 0.01,
      alpha: Math.random() * 0.7 + 0.3,
    }));

    // THUNDERSTORMS
    const thunderRain = Array.from({ length: 240 }, () => ({
      x: Math.random() * (w() + 300) - 150,
      y: Math.random() * h(),
      len: Math.random() * 35 + 20,
      vy: Math.random() * 18 + 18,
      vx: -3,
      alpha: Math.random() * 0.5 + 0.4,
    }));
    let lightningTimer = 0;
    let lightningOpacity = 0;

    // FOG particles
    const fogPuffs = Array.from({ length: 12 }, () => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      r: Math.random() * 220 + 140,
      vx: Math.random() * 0.4 + 0.1,
      alpha: Math.random() * 0.15 + 0.08,
    }));

    // DEFAULT radar particles
    const defaultParticles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 3 + 1,
      alpha: Math.random() * 0.5 + 0.1,
    }));
    let radarAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, w(), h());

      if (type === "sunny") {
        // Sun Disk & Glow
        const sunX = w() * 0.8;
        const sunY = h() * 0.18;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 220);
        sunGrad.addColorStop(0, "rgba(253, 224, 71, 0.4)");
        sunGrad.addColorStop(0.3, "rgba(251, 146, 60, 0.18)");
        sunGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 220, 0, Math.PI * 2);
        ctx.fill();

        // Sun light specks
        sunSpecks.forEach((s) => {
          s.y += s.vy;
          if (s.y < 0) {
            s.y = h();
            s.x = Math.random() * w();
          }
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(253, 224, 71, ${s.alpha})`;
          ctx.fill();
        });

        // Floating clouds
        sunClouds.forEach((c) => {
          c.x += c.speed;
          if (c.x - c.r > w()) c.x = -c.r;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          ctx.arc(c.x + c.r * 0.6, c.y - c.r * 0.2, c.r * 0.7, 0, Math.PI * 2);
          ctx.arc(c.x - c.r * 0.6, c.y + c.r * 0.1, c.r * 0.65, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${c.alpha})`;
          ctx.fill();
        });
      } else if (type === "rain") {
        // Raindrops
        ctx.strokeStyle = "rgba(148, 163, 184, 0.65)";
        ctx.lineWidth = 1.2;
        rainDrops.forEach((d) => {
          d.y += d.vy;
          d.x += d.vx;
          if (d.y > h()) {
            // Add splash ripple
            if (Math.random() < 0.3) {
              splashes.push({ x: d.x, y: h() - 10, r: 1, alpha: 0.6 });
            }
            d.y = -d.len;
            d.x = Math.random() * (w() + 200) - 100;
          }
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.vx * 2, d.y + d.len);
          ctx.globalAlpha = d.alpha;
          ctx.stroke();
        });

        // Splashes
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          s.r += 0.8;
          s.alpha -= 0.04;
          if (s.alpha <= 0) {
            splashes.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.r * 2, s.r * 0.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(186, 230, 253, ${s.alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else if (type === "snow") {
        // Snowflakes
        snowFlakes.forEach((f) => {
          f.y += f.vy;
          f.phase += f.swingSpeed;
          f.x += Math.sin(f.phase) * 0.8;

          if (f.y > h()) {
            f.y = -10;
            f.x = Math.random() * w();
          }

          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(240, 249, 255, ${f.alpha})`;
          ctx.fill();

          // Subtle snowflake glow
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 242, 254, ${f.alpha * 0.3})`;
          ctx.fill();
        });
      } else if (type === "thunder") {
        // Lightning trigger logic
        thunderRain.forEach((d) => {
          d.y += d.vy;
          d.x += d.vx;
          if (d.y > h()) {
            d.y = -d.len;
            d.x = Math.random() * (w() + 300) - 150;
          }
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.vx * 2, d.y + d.len);
          ctx.strokeStyle = `rgba(192, 132, 252, ${d.alpha})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        });

        // Lightning flash effect
        lightningTimer++;
        if (lightningTimer > 180 && Math.random() < 0.02) {
          lightningOpacity = 0.75;
          lightningTimer = 0;
        }

        if (lightningOpacity > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${lightningOpacity})`;
          ctx.fillRect(0, 0, w(), h());
          lightningOpacity -= 0.05;
        }
      } else if (type === "fog") {
        // Fog puffs
        fogPuffs.forEach((f) => {
          f.x += f.vx;
          if (f.x - f.r > w()) f.x = -f.r;

          const fogGrad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
          fogGrad.addColorStop(0, `rgba(203, 213, 225, ${f.alpha})`);
          fogGrad.addColorStop(0.7, `rgba(148, 163, 184, ${f.alpha * 0.4})`);
          fogGrad.addColorStop(1, "rgba(148, 163, 184, 0)");

          ctx.fillStyle = fogGrad;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // DEFAULT radar sweep + particles
        radarAngle += 0.008;
        const cx = w() / 2;
        const cy = h() / 2;
        const sweepRadius = Math.min(cx, cy) * 0.9;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(radarAngle);

        const gradient = ctx.createLinearGradient(0, 0, sweepRadius, 0);
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.12)");
        gradient.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, sweepRadius, -0.05, 0);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();

        // Particles
        defaultParticles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w();
          if (p.x > w()) p.x = 0;
          if (p.y < 0) p.y = h();
          if (p.y > h()) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(56, 189, 248, 0.5)";
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [type, isActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
};

const WeatherDetectorBg: React.FC = () => {
  const { weatherCondition } = useWeather();
  const targetType = normalizeWeather(weatherCondition);

  const [activeType, setActiveType] = useState<WeatherType>(targetType);
  const [prevType, setPrevType] = useState<WeatherType | null>(null);
  const [transitioning, setTransitioning] = useState<boolean>(false);

  useEffect(() => {
    if (targetType !== activeType) {
      setPrevType(activeType);
      setActiveType(targetType);
      setTransitioning(true);

      const timer = setTimeout(() => {
        setPrevType(null);
        setTransitioning(false);
      }, 1500); // 1.5 seconds smooth crossfade transition

      return () => clearTimeout(timer);
    }
  }, [targetType, activeType]);

  const getBgStyle = (t: WeatherType) => {
    switch (t) {
      case "sunny":
        return "linear-gradient(135deg, #0284c7 0%, #1e3a8a 50%, #0f172a 100%)";
      case "rain":
        return "linear-gradient(135deg, #090d16 0%, #1e293b 50%, #0f172a 100%)";
      case "snow":
        return "linear-gradient(135deg, #0b1329 0%, #1e3a5f 50%, #312e81 100%)";
      case "thunder":
        return "linear-gradient(135deg, #030712 0%, #111827 50%, #1e1035 100%)";
      case "fog":
        return "linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)";
      default:
        return "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #311042 100%)";
    }
  };

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* PREVIOUS WEATHER LAYER (Fading Out) */}
      {prevType && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: getBgStyle(prevType),
            opacity: transitioning ? 0 : 1,
            transition: "opacity 1.5s ease-in-out",
            backdropFilter: prevType === "fog" ? "blur(12px)" : "none",
            WebkitBackdropFilter: prevType === "fog" ? "blur(12px)" : "none",
          }}
        >
          <SingleWeatherCanvas type={prevType} isActive={true} />
        </div>
      )}

      {/* ACTIVE WEATHER LAYER (Fading In) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: getBgStyle(activeType),
          opacity: transitioning ? 1 : 1,
          transition: "opacity 1.5s ease-in-out",
          backdropFilter: activeType === "fog" ? "blur(14px)" : "none",
          WebkitBackdropFilter: activeType === "fog" ? "blur(14px)" : "none",
        }}
      >
        <SingleWeatherCanvas type={activeType} isActive={true} />
      </div>
    </div>
  );
};

export default WeatherDetectorBg;
