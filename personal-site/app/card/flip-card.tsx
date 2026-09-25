"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent, type MouseEvent, type CSSProperties } from "react";
import { CardIcon } from "./card-icon";
import { ShareProfile } from "./share-profile";
import styles from "./card.module.css";

const shortcuts = [
  { href: "/writing", title: "Writing", description: "Notes & ideas" },
  { href: "/experiences", title: "Experience", description: "Where I’ve been" },
  { href: "/projects", title: "Projects", description: "Things I’ve built" },
  { href: "/resume", title: "Resume", description: "The short version" },
];

const contacts = [
  { icon: "mail", label: "sicheng.ouyang@uwaterloo.ca", href: "mailto:sicheng.ouyang@uwaterloo.ca", external: false },
  { icon: "linkedin", label: "linkedin.com/in/sicheng-ouyang", href: "https://www.linkedin.com/in/sicheng-ouyang/", external: true },
  { icon: "github", label: "github.com/carols12352", href: "https://github.com/carols12352", external: true },
] as const;

// Round trigonometric CSS values: JS engines can differ in their last float bits.
// Eight tangent segments per rounded corner complete the extruded rim.
const cornerSegments = [
  { right: true, bottom: false, start: -90 },
  { right: true, bottom: true, start: 0 },
  { right: false, bottom: true, start: 90 },
  { right: false, bottom: false, start: 180 },
].flatMap((corner, index) => Array.from({ length: 8 }, (_, segment) => {
  const degrees = corner.start + (segment + .5) * 90 / 8;
  const radians = degrees * Math.PI / 180;
  return { key: `${index}-${segment}`, style: {
    left: `calc(${corner.right ? "100% - var(--radius)" : "var(--radius)"} + var(--radius) * ${Math.cos(radians).toFixed(6)})`,
    top: `calc(${corner.bottom ? "100% - var(--radius)" : "var(--radius)"} + var(--radius) * ${Math.sin(radians).toFixed(6)})`,
    transform: `translate(-50%, -50%) rotateZ(${degrees + 90}deg) rotateX(90deg)`,
  } as CSSProperties };
}));

export function FlipCard() {
  const [opened, setOpened] = useState(false);
  const [angle, setAngle] = useState({ x: -9, y: -16 });
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ id: number; x: number; y: number; rx: number; ry: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const liftRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<HTMLSpanElement>(null);
  const depthRef = useRef<HTMLDivElement>(null);
  const sequenceBusy = useRef(false);
  const animations = useRef<Animation[]>([]);
  const openTimer = useRef<number | undefined>(undefined);
  const [returning, setReturning] = useState(false);
  useEffect(() => () => {
    window.clearTimeout(openTimer.current);
    animations.current.forEach((animation) => animation.cancel());
  }, []);
  const backVisible = Math.cos(angle.y * Math.PI / 180) < 0;

  // A fixed studio light reflected by each face as its normal turns.
  function metalLighting(back = false): CSSProperties {
    const yaw = (angle.y + (back ? 180 : 0)) * Math.PI / 180;
    const pitch = angle.x * Math.PI / 180;
    // Normal dot a fixed upper-left light; roughness keeps its reflection broad.
    const illumination = Math.max(0, -.38 * Math.sin(yaw)
      + .48 * Math.sin(pitch) * Math.cos(yaw)
      + .78 * Math.cos(pitch) * Math.cos(yaw));
    return {
      "--reflection-x": `${(45 + Math.sin(yaw) * 60).toFixed(3)}%`,
      "--reflection-y": `${(30 + Math.sin(pitch) * 75).toFixed(3)}%`,
      "--light-strength": (.2 + illumination * .65).toFixed(3),
      "--metal-shade": (.025 + (1 - illumination) * .3).toFixed(3),
      "--edge-light": (.2 + illumination * .55).toFixed(3),
    } as CSSProperties;
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (sequenceBusy.current || !event.isPrimary || event.button !== 0) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, rx: angle.x, ry: angle.y, moved: false };
    suppressClick.current = false;
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < 7) return;
    // Capture only once it is a drag, so a plain tap still reaches links on the card.
    if (!start.moved) event.currentTarget.setPointerCapture(event.pointerId);
    start.moved = true;
    suppressClick.current = true;
    setDragging(true);
    setAngle({ x: Math.max(-35, Math.min(35, start.rx - dy * .3)), y: start.ry + dx * .7 });
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (gesture.current?.id !== event.pointerId) return;
    if (event.type === "pointercancel") suppressClick.current = true;
    gesture.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  async function reveal() {
    if (sequenceBusy.current) return;
    const target = opened
      ? { x: -9, y: Math.round(angle.y / 360) * 360 - 16 }
      : { x: -6, y: Math.round(angle.y / 360) * 360 };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      || ["none", "reduced"].includes(document.documentElement.dataset.motion ?? "");
    if (reduced) {
      setAngle(target);
      setOpened((value) => !value);
      return;
    }
    sequenceBusy.current = true;
    setReturning(true);
    const currentTransform = bodyRef.current ? getComputedStyle(bodyRef.current).transform : "none";
    setAngle(target);
    const animate = (element: HTMLElement | null, frames: Keyframe[], duration: number, fill: FillMode = "none", easing = "cubic-bezier(.22,.65,.3,1)") => {
      if (!element) return;
      const animation = element.animate(frames, { duration, fill, easing });
      animations.current.push(animation);
      return animation;
    };
    // Gravity: decelerate into the apex, accelerate out of it.
    const rise = "cubic-bezier(.2,.7,.4,1)";
    const fall = "cubic-bezier(.6,0,.8,.45)";
    const soft = "cubic-bezier(.45,0,.55,1)";
    const pose = `rotateX(${target.x}deg) rotateY(${target.y}deg)`;
    try {
      if (opened) {
        // Close with a small hop so the card lands back into its idle pose.
        setOpened(false);
        const duration = 640;
        const turn = animate(bodyRef.current, [
          { transform: currentTransform, offset: 0, easing: "cubic-bezier(.3,.7,.3,1)" },
          { transform: pose, offset: .7 },
          { transform: pose, offset: 1 },
        ], duration, "none", "linear");
        const hop = animate(liftRef.current, [
          { transform: "translateY(0)", offset: 0, easing: rise },
          { transform: "translateY(-18px)", offset: .32, easing: fall },
          { transform: "translateY(3px)", offset: .64, easing: rise },
          { transform: "translateY(-3px)", offset: .82, easing: soft },
          { transform: "translateY(0)", offset: 1 },
        ], duration, "none", "linear");
        const tilt = animate(depthRef.current, [
          { transform: "translateZ(0) rotateX(0deg)", offset: 0, easing: rise },
          { transform: "translateZ(20px) rotateX(-4deg)", offset: .32, easing: fall },
          { transform: "translateZ(-8px) rotateX(2.5deg)", offset: .64, easing: rise },
          { transform: "translateZ(3px) rotateX(-.8deg)", offset: .82, easing: soft },
          { transform: "translateZ(0) rotateX(0deg)", offset: 1 },
        ], duration, "none", "linear");
        const shadow = animate(shadowRef.current, [
          { opacity: .18, transform: "scale(1)", offset: 0, easing: rise },
          { opacity: .12, transform: "scale(1.1)", offset: .32, easing: fall },
          { opacity: .22, transform: "scale(.95)", offset: .64, easing: rise },
          { opacity: .17, transform: "scale(1.02)", offset: .82, easing: soft },
          { opacity: .18, transform: "scale(1)", offset: 1 },
        ], duration, "none", "linear");
        await Promise.all([turn?.finished, hop?.finished, tilt?.finished, shadow?.finished]);
        return;
      }
      // One continuous timeline: crouch, launch, hang, fall, land with one small rebound.
      const duration = 1000;
      const turn = animate(bodyRef.current, [
        { transform: currentTransform, offset: 0, easing: "cubic-bezier(.35,.1,.25,1)" },
        { transform: pose, offset: .5 },
        { transform: pose, offset: 1 },
      ], duration, "none", "linear");
      const lift = animate(liftRef.current, [
        { transform: "translate(0, 0)", offset: 0, easing: soft },
        { transform: "translate(0, 7px)", offset: .14, easing: rise },
        { transform: "translate(7px, -66px)", offset: .44, easing: soft },
        { transform: "translate(6px, -63px)", offset: .5, easing: fall },
        { transform: "translate(0, 4px)", offset: .75, easing: rise },
        { transform: "translate(0, -9px)", offset: .87, easing: soft },
        { transform: "translate(0, 0)", offset: 1 },
      ], duration, "none", "linear");
      const toss = animate(depthRef.current, [
        { transform: "translateZ(0) rotateX(0deg) rotateZ(0deg)", offset: 0, easing: soft },
        { transform: "translateZ(-12px) rotateX(5deg) rotateZ(0deg)", offset: .14, easing: rise },
        { transform: "translateZ(85px) rotateX(-12deg) rotateZ(-2deg)", offset: .44, easing: soft },
        { transform: "translateZ(80px) rotateX(-10deg) rotateZ(-1.6deg)", offset: .5, easing: fall },
        { transform: "translateZ(-10px) rotateX(3.5deg) rotateZ(.4deg)", offset: .75, easing: rise },
        { transform: "translateZ(8px) rotateX(-1.5deg) rotateZ(-.2deg)", offset: .87, easing: soft },
        { transform: "translateZ(0) rotateX(0deg) rotateZ(0deg)", offset: 1 },
      ], duration, "none", "linear");
      const shadow = animate(shadowRef.current, [
        { opacity: .18, transform: "translateX(0) scale(1)", filter: "blur(17px)", offset: 0, easing: soft },
        { opacity: .23, transform: "translateX(0) scale(.95)", filter: "blur(15px)", offset: .14, easing: rise },
        { opacity: .06, transform: "translateX(-8px) scale(1.32)", filter: "blur(25px)", offset: .44, easing: soft },
        { opacity: .07, transform: "translateX(-7px) scale(1.28)", filter: "blur(24px)", offset: .5, easing: fall },
        { opacity: .24, transform: "translateX(0) scale(.94)", filter: "blur(15px)", offset: .75, easing: rise },
        { opacity: .15, transform: "translateX(0) scale(1.08)", filter: "blur(19px)", offset: .87, easing: soft },
        { opacity: .18, transform: "translateX(0) scale(1)", filter: "blur(17px)", offset: 1 },
      ], duration, "none", "linear");
      // Links begin unfolding while the card hangs at the top of its arc.
      openTimer.current = window.setTimeout(() => setOpened(true), duration * .42);
      await Promise.all([turn?.finished, lift?.finished, toss?.finished, shadow?.finished]);
    } catch {
      // An unmounted card cancels its pending animation sequence.
    } finally {
      window.clearTimeout(openTimer.current);
      animations.current.forEach((animation) => animation.cancel());
      animations.current = [];
      sequenceBusy.current = false;
      setReturning(false);
    }
  }

  function tap(event: MouseEvent<HTMLDivElement>) {
    if (suppressClick.current) {
      event.preventDefault();
      return;
    }
    if (!(event.target as Element).closest("a")) void reveal();
  }

  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (sequenceBusy.current) { event.preventDefault(); return; }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void reveal();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      setAngle((value) => ({ ...value, y: value.y + (event.key === "ArrowRight" ? 30 : -30) }));
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      setAngle((value) => ({ ...value, x: Math.max(-35, Math.min(35, value.x + (event.key === "ArrowUp" ? -10 : 10))) }));
    } else if (event.key === "Escape" && opened) {
      void reveal();
    }
  }

  return (
    <div className={styles.composition} data-opened={opened}>
      <div className={styles.cardScene}>
      <span ref={shadowRef} className={styles.groundShadow} aria-hidden="true" />
      <div ref={liftRef} className={styles.cardLift}>
        <div className={styles.stage}>
          <div ref={depthRef} className={styles.toss}>
          <div role="group" tabIndex={0} className={styles.cardControl}
            aria-roledescription="business card"
            aria-label="Sicheng Ouyang’s card. Drag or use arrow keys to rotate. Tap or press Enter to show quick links."
            aria-busy={returning} aria-describedby="card-instructions"
            onPointerDown={startDrag} onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={endDrag}
            onLostPointerCapture={(event) => {
              // Touch starts implicitly captured by the tapped child; taking capture fires a bubbling loss from it.
              if (event.target !== event.currentTarget) return;
              gesture.current = null;
              setDragging(false);
            }}
            onKeyDown={keyboard}
            onClick={tap}
            data-dragging={dragging}
          >
            <span ref={bodyRef} className={styles.cardBody} data-returning={returning} data-dragging={dragging} style={{ ...metalLighting(), transform: `rotateX(${angle.x}deg) rotateY(${angle.y}deg)` }}>
              <span className={`${styles.rim} ${styles.rimTop}`} aria-hidden="true" />
              <span className={`${styles.rim} ${styles.rimBottom}`} aria-hidden="true" />
              <span className={`${styles.rim} ${styles.rimLeft}`} aria-hidden="true" />
              <span className={`${styles.rim} ${styles.rimRight}`} aria-hidden="true" />
              {cornerSegments.map((segment) => <span key={segment.key} className={`${styles.rim} ${styles.rimCorner}`} style={segment.style} aria-hidden="true" />)}
              <span className={`${styles.face} ${styles.front}`} aria-hidden={backVisible} style={metalLighting()}>
                <Link className={styles.logo} href="/" aria-label="Sicheng Ouyang’s website" tabIndex={backVisible ? -1 : 0} draggable={false}>
                  <Image src="/favicon-light.png" alt="" width={100} height={100} priority draggable={false} />
                </Link>
                <span className={styles.frontIdentity}>
                  <span className={styles.name}>Sicheng Ouyang</span>
                  <a className={styles.frontRole} href="https://uwaterloo.ca/future-students/programs/software-engineering" target="_blank" rel="noreferrer" tabIndex={backVisible ? -1 : 0} draggable={false}>Software Engineering @ UWaterloo</a>
                </span>
              </span>
              <span className={`${styles.face} ${styles.back}`} aria-hidden={!backVisible} style={metalLighting(true)}>
                <span className={styles.backTop}>Let’s connect.<Image src="/favicon-light.png" alt="" width={32} height={32} draggable={false} /></span>
                <span className={styles.contactRows}>
                  {contacts.map((contact) => (
                    <a key={contact.icon} href={contact.href} target={contact.external ? "_blank" : undefined} rel={contact.external ? "noreferrer" : undefined} tabIndex={backVisible ? 0 : -1} draggable={false}>
                      <CardIcon name={contact.icon} /><span>{contact.label}</span>
                    </a>
                  ))}
                </span>
                <span className={styles.backBottom}>Sicheng Ouyang<span>Waterloo, Ontario</span></span>
              </span>
            </span>
          </div>
          </div>
        </div>
      </div>
      </div>
      <div className={styles.instructions} id="card-instructions">
        <span>Drag to rotate <span aria-hidden="true">·</span> Tap to {opened ? "close" : "open"}</span>
        <button className={styles.turn} type="button" disabled={returning} onClick={() => setAngle((value) => ({ x: -6, y: Math.round(value.y / 180) * 180 + 180 }))} aria-label={backVisible ? "Show front of card" : "Show contact details on back of card"}>Turn over <span aria-hidden="true">↻</span></button>
      </div>
      <div id="card-links" className={styles.tray} aria-hidden={!opened} inert={!opened}>
        <div className={styles.trayInner}>
          <div className={styles.actions}><a className={styles.save} href="/card/contact.vcf" download="Sicheng-Ouyang.vcf"><CardIcon name="contact" />Save contact</a><ShareProfile /></div>
          <nav className={styles.contactLinks} aria-label="Contact links"><a href="mailto:sicheng.ouyang@uwaterloo.ca">Email</a><a href="https://www.linkedin.com/in/sicheng-ouyang/" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://github.com/carols12352" target="_blank" rel="noreferrer">GitHub</a></nav>
          <h2 className={styles.moreTitle}>More about me</h2>
          <nav className={styles.shortcuts} aria-label="More about Sicheng">
            {shortcuts.map((link) => <Link key={link.href} href={link.href}><span><strong>{link.title}</strong><small>{link.description}</small></span><CardIcon name="arrow" /></Link>)}
          </nav>
        </div>
      </div>
    </div>
  );
}
