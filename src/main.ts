import Phaser from 'phaser';
import './style.css';
import { advanceDiscovery } from './discovery';
import { getRealmQuest, isQuestComplete } from './realm-content';
import { calculateBreeze, getGrassRepulsion } from './meadow-motion';
import {
  awardDiscovery,
  getRankProgress,
  parseProgression,
  PROGRESSION_STORAGE_KEY,
  type PlayerProgression,
} from './progression';

function readSavedProgression(): PlayerProgression {
  try {
    return parseProgression(window.localStorage.getItem(PROGRESSION_STORAGE_KEY));
  } catch {
    return parseProgression(null);
  }
}

let playerProgression = readSavedProgression();
const xpValue = document.getElementById('player-xp');
const rankBadge = document.getElementById('rank-badge');
const xpNextLabel = document.getElementById('xp-next-label');
const xpProgress = document.getElementById('xp-progress');
const xpProgressFill = document.getElementById('xp-progress-fill');
const xpStatus = document.getElementById('xp-status');

function renderProgression() {
  const details = getRankProgress(playerProgression.xp);

  if (xpValue) xpValue.textContent = `${details.xp.toLocaleString()} XP`;
  if (rankBadge) {
    rankBadge.textContent = details.rank;
    rankBadge.className = `rank-badge rank-${details.rank.toLowerCase()}`;
  }
  if (xpNextLabel) {
    xpNextLabel.textContent = details.nextRank && details.nextRankXP !== null
      ? `${details.nextRankXP - details.xp} XP to ${details.nextRank}`
      : 'Highest rank reached';
  }
  if (xpProgress) xpProgress.setAttribute('aria-valuenow', String(details.progressPercent));
  if (xpProgressFill) xpProgressFill.style.width = `${details.progressPercent}%`;
}

function saveProgression(): boolean {
  try {
    window.localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(playerProgression));
    return true;
  } catch {
    return false;
  }
}

renderProgression();

class WhisperingScene extends Phaser.Scene {
  private lightObjects: Phaser.GameObjects.Arc[] = [];
  private rune!: Phaser.GameObjects.Graphics;
  private halo!: Phaser.GameObjects.Arc;
  private progress = 0;
  private solved = false;
  private hint!: HTMLElement;
  private reducedMotion = false;
  private lightButtons: HTMLButtonElement[] = [];
  private windMotes: Phaser.GameObjects.Arc[] = [];
  private hiddenObjectViews: Array<{ id: string; glow: Phaser.GameObjects.Arc; icon: Phaser.GameObjects.Text; found: boolean }> = [];
  private questProgress!: HTMLElement;
  private questHint!: HTMLElement;
  private windElapsed = 0;
  private meadowGraphics!: Phaser.GameObjects.Graphics;
  private player!: Phaser.GameObjects.Container;
  private playerX = 400;
  private playerY = 340;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private moveKeys: Record<string, Phaser.Input.Keyboard.Key> = {};
  private moveVector = { x: 0, y: 0 };
  private moveButtons: HTMLButtonElement[] = [];
  private readonly quest = getRealmQuest('The Whispering Realm')!;

  constructor() {
    super('WhisperingRealm');
  }

  create() {
    const { width, height } = this.scale;
    this.progress = 0;
    this.solved = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.cameras.main.setBackgroundColor('#0a1025');

    const backdrop = this.add.graphics();
    backdrop.fillGradientStyle(0x111d3b, 0x111d3b, 0x080e20, 0x080e20, 1);
    backdrop.fillRect(0, 0, width, height);

    for (let i = 0; i < 8; i++) {
      const x = width * (0.08 + i * 0.12);
      const y = height * (0.18 + (i % 3) * 0.2);
      const haze = this.add.circle(x, y, 34 + (i % 3) * 18, 0x4ad9d0, 0.035);
      if (!this.reducedMotion) this.tweens.add({
        targets: haze, x: x + (i % 2 === 0 ? 18 : -18), alpha: 0.07,
        duration: 2600 + i * 190, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
    }

    const island = this.add.graphics();
    island.fillStyle(0x17294a, 0.96);
    island.fillEllipse(width * 0.5, height * 0.76, width * 0.56, height * 0.18);
    island.lineStyle(1, 0x5edbd1, 0.28);
    island.strokeEllipse(width * 0.5, height * 0.75, width * 0.56, height * 0.18);

    // A wide, layered meadow makes the little floating island feel part of a much larger land.
    const distantLand = this.add.graphics();
    distantLand.fillStyle(0x284d58, 0.52);
    distantLand.fillPoints([
      new Phaser.Geom.Point(0, height * 0.67), new Phaser.Geom.Point(width * 0.12, height * 0.57),
      new Phaser.Geom.Point(width * 0.28, height * 0.64), new Phaser.Geom.Point(width * 0.43, height * 0.54),
      new Phaser.Geom.Point(width * 0.62, height * 0.63), new Phaser.Geom.Point(width * 0.79, height * 0.55),
      new Phaser.Geom.Point(width, height * 0.62), new Phaser.Geom.Point(width, height),
      new Phaser.Geom.Point(0, height),
    ], true, true);
    const nearLand = this.add.graphics();
    nearLand.fillStyle(0x173b43, 0.86);
    nearLand.fillPoints([
      new Phaser.Geom.Point(0, height * 0.78), new Phaser.Geom.Point(width * 0.18, height * 0.71),
      new Phaser.Geom.Point(width * 0.35, height * 0.77), new Phaser.Geom.Point(width * 0.54, height * 0.69),
      new Phaser.Geom.Point(width * 0.75, height * 0.76), new Phaser.Geom.Point(width, height * 0.7),
      new Phaser.Geom.Point(width, height), new Phaser.Geom.Point(0, height),
    ], true, true);
    this.meadowGraphics = this.add.graphics();
    this.playerX = width * 0.5;
    this.playerY = height * 0.82;
    this.player = this.add.container(this.playerX, this.playerY);
    const playerShadow = this.add.ellipse(0, 11, 23, 7, 0x061323, 0.42);
    const playerGlow = this.add.circle(0, -2, 18, 0x9af6e7, 0.08);
    const cloak = this.add.ellipse(0, 1, 17, 22, 0x8ccfc9, 0.98);
    const cloakShade = this.add.ellipse(2, 3, 9, 15, 0x426d83, 0.95);
    const face = this.add.circle(-1, -11, 6, 0xf2d6b7, 1);
    const hood = this.add.arc(-1, -13, 8, 190, 350, false, 0x253b58, 1);
    this.player.add([playerShadow, playerGlow, cloak, cloakShade, face, hood]);
    this.player.setDepth(4);
    if (!this.reducedMotion) this.tweens.add({
      targets: playerGlow, alpha: 0.16, scale: 1.18, duration: 1900,
      yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });

    this.cursors = this.input.keyboard?.createCursorKeys();
    if (this.input.keyboard) {
      this.moveKeys = {
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }
    this.moveButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-move]'));
    this.moveButtons.forEach((button) => {
      const direction = button.dataset.move ?? '';
      const start = (event: Event) => {
        event.preventDefault();
        const vectors: Record<string, { x: number; y: number }> = {
          up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
          left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
        };
        this.moveVector = vectors[direction] ?? { x: 0, y: 0 };
      };
      const stop = () => { this.moveVector = { x: 0, y: 0 }; };
      button.addEventListener('pointerdown', start);
      button.addEventListener('pointerup', stop);
      button.addEventListener('pointerleave', stop);
      button.addEventListener('pointercancel', stop);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        button.removeEventListener('pointerdown', start);
        button.removeEventListener('pointerup', stop);
        button.removeEventListener('pointerleave', stop);
        button.removeEventListener('pointercancel', stop);
      });
    });

    this.windMotes = [];
    for (let i = 0; i < 34; i++) {
      const x = Phaser.Math.Between(18, Math.max(19, width - 18));
      const y = Phaser.Math.Between(18, Math.max(19, height - 18));
      const dot = this.add.circle(x, y, Phaser.Math.FloatBetween(0.6, 1.8), 0xb4fff3, Phaser.Math.FloatBetween(0.18, 0.7));
      this.windMotes.push(dot);
      if (!this.reducedMotion) this.tweens.add({
        targets: dot, alpha: 0.08, duration: Phaser.Math.Between(900, 2400),
        yoyo: true, repeat: -1,
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

    if (!this.reducedMotion) this.tweens.add({
      targets: this.halo, scale: 1.45, alpha: 0.13, duration: 2100,
      yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });

    this.questProgress = document.getElementById('quest-progress') as HTMLElement;
    this.questHint = document.getElementById('quest-hint') as HTMLElement;
    const foundAtStart = this.quest.objects.filter((object) => playerProgression.completedDiscoveries.includes(object.id)).length;
    this.questProgress.textContent = `${foundAtStart} of ${this.quest.objects.length} hidden treasures found`;
    this.questHint.textContent = foundAtStart === this.quest.objects.length
      ? 'Your little treasures are safe here. Take a slow breath and enjoy the breeze.'
      : 'A soft breeze sometimes reveals a tiny glimmer. Tap it when you spot one.';

    this.hiddenObjectViews = this.quest.objects.map((object) => {
      const x = width * object.x;
      const y = height * object.y;
      const found = playerProgression.completedDiscoveries.includes(object.id);
      const glow = this.add.circle(x, y, 17, 0xa9e9df, found ? 0.08 : this.reducedMotion ? 0.1 : 0.025);
      const icon = this.add.text(x, y, object.symbol, {
        fontFamily: 'Georgia, serif', fontSize: '19px', color: '#e5fff8',
        stroke: '#6bded0', strokeThickness: 1,
      }).setOrigin(0.5).setAlpha(found ? 0.45 : this.reducedMotion ? 0.38 : 0.025);
      const hitArea = this.add.zone(x, y, 42, 42).setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => this.collectHiddenObject(object.id));
      return { id: object.id, glow, icon, found };
    });

    const positions = [
      { x: width * 0.25, y: height * 0.38, color: 0x9affee },
      { x: width * 0.73, y: height * 0.29, color: 0xf5c9a7 },
      { x: width * 0.68, y: height * 0.62, color: 0xb8a8ff },
    ];

    this.lightObjects = positions.map(({ x, y, color }, index) => {
      const glow = this.add.circle(x, y, 11, color, index === 0 ? 0.18 : 0.09);
      const light = this.add.circle(x, y, 4, color, 0.95);
      const hitArea = this.add.zone(x, y, 48, 48).setInteractive({ useHandCursor: true });
      if (!this.reducedMotion) this.tweens.add({
        targets: [glow, light], y: y - 9, alpha: 0.42,
        duration: 1450 + index * 300, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
      hitArea.on('pointerdown', () => this.tapLight(index));
      return light;
    });

    this.hint = document.getElementById('world-hint') as HTMLElement;
    this.lightButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-light-index]'));
    this.lightButtons.forEach((button) => {
      const onClick = () => this.tapLight(Number(button.dataset.lightIndex));
      button.addEventListener('click', onClick);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => button.removeEventListener('click', onClick));
    });
    this.hint.textContent = 'Begin with the mint light. After it answers, follow the violet trace.';
  }

  update(_time: number, delta: number) {
    const { width, height } = this.scale;
    const keyboardX = (this.cursors?.right.isDown || this.moveKeys.right?.isDown ? 1 : 0)
      - (this.cursors?.left.isDown || this.moveKeys.left?.isDown ? 1 : 0);
    const keyboardY = (this.cursors?.down.isDown || this.moveKeys.down?.isDown ? 1 : 0)
      - (this.cursors?.up.isDown || this.moveKeys.up?.isDown ? 1 : 0);
    const moveX = keyboardX || this.moveVector.x;
    const moveY = keyboardY || this.moveVector.y;
    const length = Math.hypot(moveX, moveY) || 1;
    const step = (delta / 1000) * 128;
    this.playerX = Phaser.Math.Clamp(this.playerX + (moveX / length) * step, 18, width - 18);
    this.playerY = Phaser.Math.Clamp(this.playerY + (moveY / length) * step, height * 0.56, height - 24);
    this.player.setPosition(this.playerX, this.playerY);

    this.windElapsed += delta / 1000;
    const breeze = calculateBreeze(this.windElapsed);
    this.drawMeadow(breeze);
    if (this.reducedMotion) return;

    // Gentle, slow wind: motes drift horizontally and float without abrupt gusts.
    this.windMotes.forEach((mote, index) => {
      mote.x += (0.08 + breeze * 0.18) * (delta / 16.67);
      mote.y += Math.sin(this.windElapsed * 0.45 + index * 0.7) * 0.035 * (delta / 16.67);
      if (mote.x > width + 8) mote.x = -8;
      if (mote.x < -8) mote.x = width + 8;
    });
    // The breeze reveals treasures gradually; they remain tappable for touch and mouse.
    const reveal = Math.max(0, Math.sin(this.windElapsed * 0.38 - 0.7));
    this.hiddenObjectViews.forEach((view, index) => {
      if (view.found) return;
      const localReveal = Math.max(0, reveal - index * 0.08);
      view.glow.setAlpha(0.025 + localReveal * 0.22);
      view.icon.setAlpha(0.025 + localReveal * 0.86);
    });
  }

  private drawMeadow(breeze: number) {
    const graphics = this.meadowGraphics;
    const { width, height } = this.scale;
    graphics.clear();
    const rows = 4;
    const bladesPerRow = 48;
    for (let row = 0; row < rows; row++) {
      const rowDepth = row / (rows - 1);
      const baseY = height * (0.64 + rowDepth * 0.34);
      for (let i = 0; i < bladesPerRow; i++) {
        const seed = i * 19.19 + row * 41.7;
        const x = ((i + 0.5) / bladesPerRow) * width + Math.sin(seed) * 5;
        const y = baseY + Math.sin(seed * 0.31) * 9;
        const grain = (i + row) % 5 === 0 || (i + row * 3) % 11 === 0;
        const bladeHeight = (grain ? 10 : 8) + ((Math.sin(seed * 0.73) + 1) * 4);
        const phase = seed * 0.13;
        const sway = this.reducedMotion ? 0 : Math.sin(this.windElapsed * 1.05 + phase) * 2.8 + breeze * 5.5;
        const repulsion = getGrassRepulsion(x, y, this.playerX, this.playerY, 42);
        const bend = repulsion.direction * repulsion.strength * 16;
        const tipX = x + sway + bend + (grain ? 1.5 : 0);
        const tipY = y - bladeHeight * (1 - repulsion.strength * 0.14);
        const color = grain
          ? (row % 2 ? 0xe6c96f : 0xf1d98a)
          : (row % 2 ? 0x5ca78a : 0x76bd9b);
        const alpha = 0.36 + rowDepth * 0.48;
        graphics.lineStyle(grain ? 1.35 : 1.05, color, alpha);
        graphics.lineBetween(x, y, tipX, tipY);
        if (grain) {
          graphics.fillStyle(0xf3d77c, alpha);
          graphics.fillCircle(tipX + 0.6, tipY - 1.5, 1.45);
          graphics.fillCircle(tipX - 1.2, tipY + 0.3, 1.05);
        }
      }
    }
  }

  private collectHiddenObject(objectId: string) {
    const object = this.quest.objects.find((item) => item.id === objectId);
    const view = this.hiddenObjectViews.find((item) => item.id === objectId);
    if (!object || !view || view.found) return;

    const award = awardDiscovery(playerProgression, object.id, object.xp);
    playerProgression = award.progression;
    view.found = true;
    view.icon.setAlpha(1).setColor('#baf8c9');
    view.glow.setFillStyle(0xbaf8c9, 0.22);
    view.glow.setRadius(22);
    this.questProgress.textContent = `${this.quest.objects.filter((item) => playerProgression.completedDiscoveries.includes(item.id)).length} of ${this.quest.objects.length} hidden treasures found`;
    this.questHint.textContent = `${object.name} found. ${object.hint}`;

    let totalAward = award.awarded;
    if (isQuestComplete(this.quest, playerProgression.completedDiscoveries)) {
      const questAward = awardDiscovery(playerProgression, this.quest.id, this.quest.completionXP);
      playerProgression = questAward.progression;
      totalAward += questAward.awarded;
      this.questHint.textContent = questAward.awarded > 0
        ? `Quest complete: ${this.quest.title}. All three treasures are home. +${questAward.awarded} bonus XP. Rest here as long as you like.`
        : `Quest complete: ${this.quest.title}. All three treasures are home. Enjoy the quiet.`;
    }

    const saved = saveProgression();
    renderProgression();
    if (xpStatus) {
      xpStatus.textContent = saved
        ? `+${totalAward} XP earned. Your discoveries are saved on this device.`
        : `+${totalAward} XP earned for this session, but browser storage is unavailable so progress may not persist after refresh.`;
    }
  }

  private tapLight(index: number) {
    if (this.solved || !Number.isInteger(index) || index < 0 || index >= this.lightObjects.length) return;

    const result = advanceDiscovery(this.progress, index);
    this.progress = result.progress;
    this.solved = result.solved;
    this.hint.textContent = result.message;

    if (result.solved) {
      this.rune.setAlpha(1);
      this.lightObjects.forEach((light) => light.setAlpha(1));
      const award = awardDiscovery(playerProgression, 'whispering-first-discovery');
      playerProgression = award.progression;

      if (award.awarded > 0) {
        const saved = saveProgression();
        renderProgression();
        if (xpStatus) {
          xpStatus.textContent = saved
            ? `+${award.awarded} XP earned! Your first discovery has been saved on this device.`
            : `+${award.awarded} XP earned for this session, but browser storage is unavailable so it may not persist after refresh.`;
        }
      } else if (xpStatus) {
        xpStatus.textContent = 'This discovery is already recorded. Keep your XP and rank—repeat clears do not farm extra XP.';
      }

      if (!this.reducedMotion) {
        this.tweens.add({ targets: this.rune, alpha: 0.65, duration: 650, yoyo: true, repeat: 1 });
        this.tweens.add({ targets: this.halo, scale: 1.9, alpha: 0.2, duration: 900, yoyo: true, ease: 'Sine.out' });
      }
      return;
    }

    if (!this.reducedMotion) {
      this.tweens.add({ targets: this.lightObjects[index], scale: 1.8, duration: 180, yoyo: true, ease: 'Sine.out' });
    }
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0a1025',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
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
