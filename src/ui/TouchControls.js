import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const JOYSTICK_RADIUS = 50;
const JOYSTICK_THUMB_RADIUS = 22;
const FIRE_BUTTON_RADIUS = 36;
const DEAD_ZONE = 8;
const DEPTH = 1000;
const ALPHA_IDLE = 0.25;
const ALPHA_ACTIVE = 0.45;

export class TouchControls {
  constructor(scene) {
    this.scene = scene;

    // State — read by Player.handleInput()
    this.dirX = 0;   // -1 to 1
    this.dirY = 0;   // -1 to 1
    this.isFiring = false;

    // Track which pointer is controlling each control
    this.joystickPointerId = null;
    this.firePointerId = null;

    // Only show on touch-capable devices
    this.enabled = this.isTouchDevice();
    if (!this.enabled) return;

    this.createJoystick();
    this.createFireButton();
    this.setupPointerEvents();
  }

  isTouchDevice() {
    return ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0);
  }

  createJoystick() {
    // Position: bottom-right
    this.joyBaseX = GAME_WIDTH - 90;
    this.joyBaseY = GAME_HEIGHT - 100;

    // Base ring
    this.joyBase = this.scene.add.graphics().setDepth(DEPTH);
    this.joyBase.lineStyle(2, 0xffffff, ALPHA_IDLE);
    this.joyBase.strokeCircle(this.joyBaseX, this.joyBaseY, JOYSTICK_RADIUS);
    // Subtle fill
    this.joyBase.fillStyle(0xffffff, 0.05);
    this.joyBase.fillCircle(this.joyBaseX, this.joyBaseY, JOYSTICK_RADIUS);

    // Thumb
    this.joyThumb = this.scene.add.graphics().setDepth(DEPTH + 1);
    this.drawThumb(this.joyBaseX, this.joyBaseY, ALPHA_IDLE);

    // Direction indicators (small arrows/dots)
    this.joyIndicators = this.scene.add.graphics().setDepth(DEPTH);
    this.joyIndicators.fillStyle(0xffffff, ALPHA_IDLE * 0.6);
    const cx = this.joyBaseX;
    const cy = this.joyBaseY;
    const offset = JOYSTICK_RADIUS - 10;
    // Up
    this.drawTriangle(this.joyIndicators, cx, cy - offset, 6, 0);
    // Down
    this.drawTriangle(this.joyIndicators, cx, cy + offset, 6, Math.PI);
    // Left
    this.drawTriangle(this.joyIndicators, cx - offset, cy, 6, -Math.PI / 2);
    // Right
    this.drawTriangle(this.joyIndicators, cx + offset, cy, 6, Math.PI / 2);
  }

  drawTriangle(graphics, x, y, size, rotation) {
    const points = [];
    for (let i = 0; i < 3; i++) {
      const angle = rotation + (i * Math.PI * 2) / 3 - Math.PI / 2;
      points.push(x + Math.cos(angle) * size);
      points.push(y + Math.sin(angle) * size);
    }
    graphics.fillTriangle(points[0], points[1], points[2], points[3], points[4], points[5]);
  }

  drawThumb(x, y, alpha) {
    this.joyThumb.clear();
    this.joyThumb.fillStyle(0xffffff, alpha);
    this.joyThumb.fillCircle(x, y, JOYSTICK_THUMB_RADIUS);
    this.joyThumb.lineStyle(2, 0xffffff, alpha * 1.5);
    this.joyThumb.strokeCircle(x, y, JOYSTICK_THUMB_RADIUS);
  }

  createFireButton() {
    // Position: bottom-left
    this.fireBtnX = 90;
    this.fireBtnY = GAME_HEIGHT - 100;

    this.fireGraphics = this.scene.add.graphics().setDepth(DEPTH);
    this.drawFireButton(ALPHA_IDLE);
  }

  drawFireButton(alpha) {
    this.fireGraphics.clear();
    // Outer ring
    this.fireGraphics.lineStyle(2, 0xff4444, alpha);
    this.fireGraphics.strokeCircle(this.fireBtnX, this.fireBtnY, FIRE_BUTTON_RADIUS);
    // Fill
    this.fireGraphics.fillStyle(0xff4444, alpha * 0.4);
    this.fireGraphics.fillCircle(this.fireBtnX, this.fireBtnY, FIRE_BUTTON_RADIUS);
    // Inner crosshair / dot
    this.fireGraphics.fillStyle(0xff6666, alpha * 1.5);
    this.fireGraphics.fillCircle(this.fireBtnX, this.fireBtnY, 8);
    // Label
    if (!this.fireLabel) {
      this.fireLabel = this.scene.add.text(this.fireBtnX, this.fireBtnY - FIRE_BUTTON_RADIUS - 12, 'FIRE', {
        fontSize: '10px',
        fontFamily: 'Bungee',
        color: '#ff6666',
        alpha: alpha,
      }).setOrigin(0.5).setDepth(DEPTH).setAlpha(alpha);
    }
  }

  setupPointerEvents() {
    // We need to handle raw pointer events to support multi-touch
    this.scene.input.on('pointerdown', this.onPointerDown, this);
    this.scene.input.on('pointermove', this.onPointerMove, this);
    this.scene.input.on('pointerup', this.onPointerUp, this);
  }

  onPointerDown(pointer) {
    const x = pointer.x;
    const y = pointer.y;

    // Check fire button first (bottom-left area)
    if (this.firePointerId === null) {
      const distFire = Phaser.Math.Distance.Between(x, y, this.fireBtnX, this.fireBtnY);
      if (distFire < FIRE_BUTTON_RADIUS * 1.5) {
        this.firePointerId = pointer.id;
        this.isFiring = true;
        this.drawFireButton(ALPHA_ACTIVE);
        return;
      }
    }

    // Check joystick area (bottom-right area, generous hit zone)
    if (this.joystickPointerId === null) {
      const distJoy = Phaser.Math.Distance.Between(x, y, this.joyBaseX, this.joyBaseY);
      if (distJoy < JOYSTICK_RADIUS * 1.8) {
        this.joystickPointerId = pointer.id;
        this.updateJoystick(pointer);
        return;
      }
    }
  }

  onPointerMove(pointer) {
    if (pointer.id === this.joystickPointerId) {
      this.updateJoystick(pointer);
    }
  }

  onPointerUp(pointer) {
    if (pointer.id === this.joystickPointerId) {
      this.joystickPointerId = null;
      this.dirX = 0;
      this.dirY = 0;
      this.drawThumb(this.joyBaseX, this.joyBaseY, ALPHA_IDLE);
    }
    if (pointer.id === this.firePointerId) {
      this.firePointerId = null;
      this.isFiring = false;
      this.drawFireButton(ALPHA_IDLE);
    }
  }

  updateJoystick(pointer) {
    const dx = pointer.x - this.joyBaseX;
    const dy = pointer.y - this.joyBaseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < DEAD_ZONE) {
      this.dirX = 0;
      this.dirY = 0;
      this.drawThumb(this.joyBaseX, this.joyBaseY, ALPHA_ACTIVE);
      return;
    }

    // Normalize and clamp to joystick radius
    const clampedDist = Math.min(dist, JOYSTICK_RADIUS);
    const nx = dx / dist;
    const ny = dy / dist;

    this.dirX = nx * (clampedDist / JOYSTICK_RADIUS);
    this.dirY = ny * (clampedDist / JOYSTICK_RADIUS);

    // Position the thumb visually
    const thumbX = this.joyBaseX + nx * clampedDist;
    const thumbY = this.joyBaseY + ny * clampedDist;
    this.drawThumb(thumbX, thumbY, ALPHA_ACTIVE);
  }

  destroy() {
    if (!this.enabled) return;
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    this.joyBase.destroy();
    this.joyThumb.destroy();
    this.joyIndicators.destroy();
    this.fireGraphics.destroy();
    if (this.fireLabel) this.fireLabel.destroy();
  }
}
