import Phaser from 'phaser';
import './style.css';
import { advanceDiscovery } from './discovery';

class WhisperingScene extends Phaser.Scene {
  private lightObjects: Phaser.GameObjects.Arc[] = [];
  private rune!: Phaser.GameObjects.Graphics;
  private halo!: Phaser.GameObjects.Arc;
  private progress = 0;
  private hint!: HTMLElement;

  constructor() {
    super('WhisperingRealm');
  }

  create() {
    const { width, height } = this.scale;
    this.progress = 0;
    this.cameras.main.setBackgroundColor('#0a1025');

    const backdrop = this.add.graphics();
    backdrop.fillGradientStyle(0x111d3b, 0x111d3b, 0x080e20, 0x080e20, 1);
    backdrop.fillRect(0, 0, width, height);

    for (let i = 0; i < 8; i++) {
      const x = width * (0.08 + i * 0.12);
      const y = height * (0.18 + (i % 3) * 0.2);
      const haze = this.add.circle(x, y, 34 + (i % 3) * 18, 0x4ad9d0, 0.035);
      this.tweens.add({
        targets: haze,
        x: x + (i % 2 === 0 ? 18 : -18),
        alpha: 0.07,
        duration: 2600 + i * 190,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
    }

    const island = this.add.graphics();
    island.fillStyle(0x17294a, 0.96);
    island.fillEllipse(width * 0.5, height * 0.76, width * 0.56, height * 0.18);
    island.lineStyle(1, 0x5edbd1, 0.28);
    island.strokeEllipse(width * 0.5, height * 0.75, width * 0.56, height * 0.18);

    for (let i = 0; i < 34; i++) {
      const x = Phaser.Math.Between(18, Math.max(19, width - 18));
      const y = Phaser.Math.Between(18, Math.max(19, height - 18));
      const dot = this.add.circle(x, y, Phaser.Math.FloatBetween(0.6, 1.8), 0xb4fff3, Phaser.Math.FloatBetween(0.18, 0.7));
      this.tweens.add({
        targets: dot,
        alpha: 0.08,
        duration: Phaser.Math.Between(900, 2400),
        yoyo: true,
        repeat: -1,
      });
    }

    const runeX = width * 0.5;
    const runeY = height * 0.48;
    this.halo = this.add.circle(runeX, runeY, 42, 0x57e6d5, 0.055);
    this.rune = this.add.graphics();
    this.rune.lineStyle(2, 0x91fff0, 0.75);
    this.rune.strokeCircle(runeX, runeY, 18);
    this.rune.lineBetween(runeX, runeY - 28, runeX, runeY + 28);
    this.rune.lineBetween(runeX - 22, runeY + 10, runeX + 22, runeY - 10);
    this.rune.setAlpha(0.18);

    this.tweens.add({
      targets: this.halo,
      scale: 1.45,
      alpha: 0.13,
      duration: 2100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    const positions = [
      { x: width * 0.25, y: height * 0.38, color: 0x9affee },
      { x: width * 0.73, y: height * 0.29, color: 0xf5c9a7 },
      { x: width * 0.68, y: height * 0.62, color: 0xb8a8ff },
    ];

    this.lightObjects = positions.map(({ x, y, color }, index) => {
      const glow = this.add.circle(x, y, 11, color, 0.09);
      const light = this.add.circle(x, y, 4, color, 0.95);
      const hitArea = this.add.zone(x, y, 48, 48).setInteractive({ useHandCursor: true });
      this.tweens.add({
        targets: [glow, light],
        y: y - 9,
        alpha: 0.42,
        duration: 1450 + index * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
      hitArea.on('pointerdown', () => this.tapLight(index));
      return light;
    });

    this.hint = document.getElementById('world-hint') as HTMLElement;
    this.hint.textContent = 'Touch the drifting lightObjects in the right order. Watch closely.';
  }

  private tapLight(index: number) {
    const result = advanceDiscovery(this.progress, index);
    this.progress = result.progress;
    this.hint.textContent = result.message;

    if (result.solved) {
      this.rune.setAlpha(1);
      this.lightObjects.forEach((light) => light.setAlpha(1));
      this.tweens.add({ targets: this.rune, alpha: 0.65, duration: 650, yoyo: true, repeat: 1 });
      this.tweens.add({ targets: this.halo, scale: 1.9, alpha: 0.2, duration: 900, yoyo: true, ease: 'Sine.out' });
      return;
    }

    this.tweens.add({ targets: this.lightObjects[index], scale: 1.8, duration: 180, yoyo: true, ease: 'Sine.out' });
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0a1025',
  scale: {
    mode: Phaser.Scale.FIT,
    width: 800,
    height: 440,
  },
  render: {
    antialias: true,
    pixelArt: false,
    powerPreference: 'high-performance',
  },
  scene: [WhisperingScene],
});

let audioContext: AudioContext | null = null;
let ambientGain: GainNode | null = null;

async function setAmbientSound(enabled: boolean): Promise<boolean> {
  if (!('AudioContext' in window)) return false;

  if (!audioContext) {
    audioContext = new AudioContext();
    ambientGain = audioContext.createGain();
    ambientGain.gain.value = 0.012;
    ambientGain.connect(audioContext.destination);

    [110, 164.81].forEach((frequency) => {
      const oscillator = audioContext!.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(ambientGain!);
      oscillator.start();
    });
  }

  if (enabled) {
    await audioContext.resume();
  } else {
    await audioContext.suspend();
  }
  return true;
}

const soundToggle = document.querySelector<HTMLButtonElement>('#sound-toggle');
soundToggle?.addEventListener('click', async () => {
  const enable = soundToggle.getAttribute('aria-pressed') !== 'true';
  try {
    const available = await setAmbientSound(enable);
    if (!available) {
      soundToggle.textContent = 'Audio unavailable';
      soundToggle.disabled = true;
      return;
    }
    soundToggle.setAttribute('aria-pressed', String(enable));
    soundToggle.textContent = enable ? 'Sound on' : 'Sound off';
  } catch {
    soundToggle.textContent = 'Sound unavailable';
    soundToggle.disabled = true;
  }
});

window.addEventListener('pagehide', () => {
  game.destroy(true);
  void audioContext?.close();
  audioContext = null;
  ambientGain = null;
});
