/* DOM, motion and art-pixel helpers shared by every module. */

"use strict";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const reducedMotion = () => reducedMotionQuery.matches;
const root = document.documentElement;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const cssNumber = (name, fallback) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || fallback;
const PX = () => cssNumber("--px", 3);          // one art pixel, in CSS pixels
const groundH = () => cssNumber("--ground-h", 100);
const artSize = () => {
  const px = PX();
  return { px, W: Math.ceil(window.innerWidth / px) + 1, H: Math.ceil(window.innerHeight / px) + 1 };
};
const fitCanvas = (canvas, { px, W, H }) => {
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = W * px + "px";
  canvas.style.height = H * px + "px";
};
