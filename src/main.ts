import Phaser from 'phaser';
import './style.css';
import { advanceDiscovery } from './discovery';
import { getRealmQuest, isQuestComplete } from './realm-content';
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

    this.windMotes = [];
    for (let i = 0; i < 34; i++) {
      const x = Phaser.Math.Between(18, Math.max(19, width - 18));
      const y = Phaser.Math.Between(18, Math.max(19, height - 18));
      const dot = this.add.circle(x, y, Phaser.Math.FloatBetween(0.6, 1.8), 0xb4fff3, Phaser.Math.FloatBetween(0.18, 0.7));
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
      const glow = this.add.circle(x, y, 17, 0xa9e9df, found ? 0.08 : 0.025);
      const icon = this.add.text(x, y, object.symbol, {
        fontFamily: 'Georgia, serif', fontSize: '19px', color: '#e5fff8',
        stroke: '#6bded0', strokeThickness: 1,
      }).setOrigin(0.5).setAlpha(found ? 0.45 : 0.025);
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
    if (this.reducedMotion || this.windMotes.length === 0) return;
    this.windElapsed += delta / 1000;
    // Gentle, slow wind: motes drift horizontally and float without abrupt gusts.
    const breeze = Math.sin(this.windElapsed * 0.32) * 0.38 + Math.sin(this.windElapsed * 0.11) * 0.22;
    this.windMotes.forEach((mote, index) => {
      mote.x += (0.08 + breeze * 0.18) * (delta / 16.67);
      mote.y += Math.sin(this.windElapsed * 0.45 + index * 0.7) * 0.035 * (delta / 16.67);
      if (mote.x > this.scale.width + 8) mote.x = -8;
      if (mote.x < -8) mote.x = this.scale.width + 8;
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
