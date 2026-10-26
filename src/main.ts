import Phaser from 'phaser';
import './style.css';
import { getDiscoveryMessage } from './discovery';

class WhisperingScene extends Phaser.Scene {
  private lights: Phaser.GameObjects.Arc[] = [];
  private revealed = false;
  private hint!: HTMLElement;

  constructor() {
    super('WhisperingRealm');
  }

  create() {
    const { width, height } = this.scale;
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
      const x = Phaser.Math.Between(18, width - 18);
      const y = Phaser.Math.Between(18, height - 18);
      const dot = this.add.circle(x, y, Phaser.Math.FloatBetween(0.6, 1.8), 0xb4fff3, Phaser.Math.FloatBetween(0.18, 0.7));
      this.tweens.add({ targets: dot, alpha: 0.08, duration: Phaser.Math.Between(900, 2400), yoyo: true, repeat: -1 });
    }

    const runeX = width * 0.5;
    const runeY = height * 0.48;
    const halo = this.add.circle(runeX, runeY, 42, 0x57e6d5, 0.055);
    const rune = this.add.graphics();
    rune.lineStyle(2, 0x91fff0, 0.58);
    rune.strokeCircle(runeX, runeY, 18);
    rune.lineBetween(runeX, runeY - 28, runeX, runeY + 28);
    rune.lineBetween(runeX - 22, runeY + 10, runeX + 22, runeY - 10);
    rune.setAlpha(0.22);

    this.tweens.add({ targets: halo, scale: 1.45, alpha: 0.13, duration: 2100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    this.lights = [
      this.add.circle(width * 0.25, height * 0.38, 4, 0x9affee, 0.9),
      this.add.circle(width * 0.73, height * 0.29, 3, 0xf5c9a7, 0.85),
      this.add.circle(width * 0.68, height * 0.62, 4, 0xb8a8ff, 0.9),
    ];
    this.lights.forEach((light, i) => {
      light.setInteractive({ useHandCursor: true });
      this.tweens.add({ targets: light, y: light.y - 10, alpha: 0.35, duration: 1500 + i * 350, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      light.on('pointerdown', () => this.discover(rune, halo, i));
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y > height * 0.18 && pointer.y < height * 0.84) this.discover(rune, halo, 0);
    });

    this.hint = document.getElementById('world-hint') as HTMLElement;
    this.scale.on('resize', () => this.scene.restart());
  }

  private discover(rune: Phaser.GameObjects.Graphics, halo: Phaser.GameObjects.Arc, index: number) {
    if (this.revealed) {
      this.tweens.add({ targets: halo, scale: 1.7, duration: 240, yoyo: true, ease: 'Sine.out' });
      return;
    }
    this.revealed = true;
    rune.setAlpha(1);
    this.lights.forEach((light) => light.setAlpha(1));
    this.tweens.add({ targets: rune, alpha: 0.65, duration: 650, yoyo: true, repeat: 1 });
    this.tweens.add({ targets: halo, scale: 1.9, alpha: 0.2, duration: 900, yoyo: true, ease: 'Sine.out' });
    this.hint.textContent = getDiscoveryMessage(index);
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0a1025',
  scale: {
    mode: Phaser.Scale.RESIZE,
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

const soundToggle = document.querySelector<HTMLButtonElement>('#sound-toggle');
soundToggle?.addEventListener('click', () => {
  const isOn = soundToggle.getAttribute('aria-pressed') !== 'true';
  soundToggle.setAttribute('aria-pressed', String(isOn));
  soundToggle.textContent = isOn ? 'Sound on' : 'Sound off';
  // Audio will be connected after the first-playable accessibility and sound design pass.
});

window.addEventListener('pagehide', () => game.destroy(true));
