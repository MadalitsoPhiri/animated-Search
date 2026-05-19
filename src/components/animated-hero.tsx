"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function AnimatedHero() {
  const heroWrapRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroWrapRef,
    offset: ["start start", "end start"]
  });

  const skyShift = useTransform(scrollYProgress, [0, 0.4], ["0%", "-30%"]);
  const moonY = useTransform(scrollYProgress, [0, 0.5], [0, -160]);
  const moonScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.7]);
  const layerOneY = useTransform(scrollYProgress, [0, 0.68], [0, 560]);
  const layerTwoY = useTransform(scrollYProgress, [0, 0.68], [0, 700]);
  const titleY = useTransform(scrollYProgress, [0, 0.35], [0, -120]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0]);

  return (
    <section className="hero-wrap" aria-label="Animated hero section" ref={heroWrapRef}>
      <motion.div className="hero-scene">
        <motion.div className="sky-gradient" style={{ y: skyShift }} />

        <motion.div className="moon" style={{ y: moonY, scale: moonScale }}>
          <span className="moon-glow" />
        </motion.div>

        <motion.div className="hero-copy" style={{ y: titleY, opacity: titleOpacity }}>
          <p className="hero-kicker">Scroll to descend</p>
          <h1>Drift Through Signals</h1>
          <p className="hero-subtitle">
            A cinematic search journey that reacts to your motion.
          </p>
        </motion.div>

        <motion.div className="mountain mountain-back" style={{ y: layerOneY }} />
        <motion.div className="mountain mountain-front" style={{ y: layerTwoY }} />
      </motion.div>

      <div className="hero-handoff">
        <p>Keep scrolling to open the search console</p>
      </div>
    </section>
  );
}
