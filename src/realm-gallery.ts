import { REALM_CREATURES, type RealmCreature } from './realm-creatures';

const shapes: Record<RealmCreature['form'], string> = {
  jellyfish: '<ellipse cx="60" cy="48" rx="31" ry="27" fill="BODY" opacity=".82"/><path d="M29 48 Q60 68 91 48" fill="none" stroke="ACCENT" stroke-width="3"/><path d="M39 65 Q32 81 40 94 M51 67 Q49 82 55 98 M64 67 Q72 82 66 97 M77 64 Q88 79 81 92" fill="none" stroke="ACCENT" stroke-width="3" stroke-linecap="round"/><ellipse cx="51" cy="39" rx="10" ry="6" fill="ACCENT" opacity=".75"/>',
  moth: '<path d="M58 52 Q18 8 14 43 Q17 65 56 61Z" fill="BODY" stroke="ACCENT" stroke-width="2"/><path d="M62 52 Q102 8 106 43 Q103 65 64 61Z" fill="BODY" stroke="ACCENT" stroke-width="2"/><path d="M58 54 Q39 50 39 75 Q51 72 60 60 M62 54 Q81 50 81 75 Q69 72 60 60" fill="GLOW"/><ellipse cx="60" cy="56" rx="5" ry="19" fill="ACCENT"/><path d="M58 39 Q49 26 44 30 M62 39 Q71 26 76 30" fill="none" stroke="ACCENT" stroke-width="2"/>',
  fox: '<path d="M30 65 Q23 38 39 27 L48 43 Q63 34 77 43 L87 27 Q101 43 91 65 Q80 83 60 82 Q40 82 30 65Z" fill="BODY" stroke="ACCENT" stroke-width="2"/><path d="M75 73 Q101 70 101 48 Q119 68 94 87 Q80 94 67 82Z" fill="GLOW" stroke="ACCENT" stroke-width="2"/><path d="M45 61 L51 61 M69 61 L75 61" stroke="#26314c" stroke-width="4" stroke-linecap="round"/><path d="M55 70 Q60 75 65 70" fill="none" stroke="ACCENT" stroke-width="2"/>',
  whale: '<path d="M20 55 Q32 27 68 35 Q87 39 96 54 L108 44 L104 66 L95 62 Q77 82 48 74 L34 84 L32 69Z" fill="BODY" stroke="ACCENT" stroke-width="2"/><circle cx="39" cy="51" r="3" fill="ACCENT"/><path d="M53 39 Q61 20 72 26" fill="none" stroke="ACCENT" stroke-width="2"/><circle cx="75" cy="25" r="3" fill="ACCENT"/><path d="M42 76 Q47 88 56 81" fill="none" stroke="ACCENT" stroke-width="2"/>',
  manta: '<path d="M60 35 Q43 24 20 36 Q27 53 14 76 Q40 74 60 61 Q80 74 106 76 Q93 53 100 36 Q77 24 60 35Z" fill="BODY" stroke="ACCENT" stroke-width="2"/><path d="M53 42 Q60 53 67 42 L63 72 L57 72Z" fill="ACCENT"/><circle cx="47" cy="44" r="3" fill="ACCENT"/><circle cx="73" cy="44" r="3" fill="ACCENT"/><circle cx="34" cy="51" r="3" fill="GLOW"/><circle cx="86" cy="51" r="3" fill="GLOW"/>',
  stag: '<path d="M42 47 Q60 35 78 47 L81 75 L72 79 L68 61 L52 61 L48 79 L39 75Z" fill="BODY" stroke="ACCENT" stroke-width="2"/><path d="M46 43 Q31 32 35 17 M35 26 L24 20 M35 31 L22 34 M74 43 Q89 32 85 17 M85 26 L96 20 M85 31 L98 34" fill="none" stroke="ACCENT" stroke-width="4" stroke-linecap="round"/><circle cx="51" cy="49" r="2.5" fill="#243c37"/><circle cx="69" cy="49" r="2.5" fill="#243c37"/><circle cx="32" cy="17" r="4" fill="GLOW"/><circle cx="88" cy="17" r="4" fill="GLOW"/>',
  'prism-fox': '<path d="M28 64 L34 32 L49 44 L60 38 L72 44 L87 32 L92 64 Q81 82 60 82 Q39 82 28 64Z" fill="BODY" stroke="ACCENT" stroke-width="2"/><path d="M75 73 Q103 70 99 43 L115 61 Q110 85 84 90 L65 82Z" fill="GLOW" stroke="ACCENT" stroke-width="2"/><path d="M40 59 L50 59 M70 59 L80 59" stroke="#26314c" stroke-width="4"/><path d="M60 42 L52 67 L65 67 L58 80 L74 59 L62 59 L69 42Z" fill="ACCENT" opacity=".85"/>',
  'cloud-koi': '<path d="M21 58 Q34 31 61 43 Q82 49 90 59 L107 42 L104 66 L91 61 Q69 81 43 72 Q29 68 21 58Z" fill="BODY" stroke="ACCENT" stroke-width="2"/><path d="M46 45 Q51 59 45 72 M61 44 Q67 58 61 77 M76 50 Q81 60 76 69" fill="none" stroke="GLOW" stroke-width="5"/><circle cx="36" cy="53" r="3" fill="#26314c"/><circle cx="27" cy="33" r="5" fill="ACCENT" opacity=".75"/><circle cx="92" cy="25" r="4" fill="ACCENT" opacity=".75"/>',
  scarab: '<path d="M33 49 Q33 29 60 28 Q87 29 87 49 L80 74 Q60 87 40 74Z" fill="BODY" stroke="ACCENT" stroke-width="2"/><path d="M60 31 L60 79 M39 45 L18 36 M37 57 L16 58 M41 69 L25 82 M81 45 L102 36 M83 57 L104 58 M79 69 L95 82" fill="none" stroke="ACCENT" stroke-width="3" stroke-linecap="round"/><path d="M42 38 Q60 17 78 38" fill="none" stroke="ACCENT" stroke-width="2"/><circle cx="49" cy="40" r="3" fill="GLOW"/><circle cx="71" cy="40" r="3" fill="GLOW"/>',
  'comet-dragon': '<path d="M29 66 Q17 46 38 36 L54 43 L67 31 L87 37 L94 52 L80 62 L71 79 L57 65 L45 76Z" fill="BODY" stroke="ACCENT" stroke-width="2"/><path d="M38 38 L29 21 L49 33 M72 35 L82 18 L86 39" fill="GLOW" stroke="ACCENT" stroke-width="2"/><path d="M32 68 Q10 77 16 91 Q37 86 49 73" fill="none" stroke="ACCENT" stroke-width="5" stroke-linecap="round"/><circle cx="78" cy="45" r="3" fill="#24264e"/><path d="M84 55 L94 58 L86 62" fill="none" stroke="ACCENT" stroke-width="2"/>',
  butterfly: '<path d="M57 51 Q22 12 18 43 Q16 64 55 62 Q28 78 43 88 Q58 83 60 64 Q62 83 77 88 Q92 78 65 62 Q104 64 102 43 Q98 12 63 51Z" fill="BODY" stroke="ACCENT" stroke-width="2"/><path d="M60 47 L60 75 M57 46 Q48 30 43 34 M63 46 Q72 30 77 34" stroke="ACCENT" stroke-width="2" fill="none"/><circle cx="36" cy="46" r="5" fill="GLOW"/><circle cx="84" cy="46" r="5" fill="GLOW"/><circle cx="48" cy="75" r="4" fill="#e4a0b5"/><circle cx="72" cy="75" r="4" fill="#a8caff"/>',
  wisp: '<path d="M60 19 Q84 34 75 54 Q70 67 85 74 Q65 92 47 77 Q29 66 43 49 Q54 37 60 19Z" fill="BODY" stroke="ACCENT" stroke-width="2"/><path d="M49 57 Q55 52 60 57 M65 57 Q70 52 74 57" fill="none" stroke="#30294f" stroke-width="3" stroke-linecap="round"/><path d="M52 66 Q60 72 68 66" fill="none" stroke="ACCENT" stroke-width="2"/><circle cx="38" cy="34" r="4" fill="ACCENT"/><circle cx="83" cy="43" r="3" fill="GLOW"/><circle cx="36" cy="76" r="2.5" fill="GLOW"/>',
};

export function renderCreatureSvg(creature: RealmCreature): string {
  const drawing = shapes[creature.form]
    .replaceAll('BODY', `#${creature.body.toString(16).padStart(6, '0')}`)
    .replaceAll('GLOW', `#${creature.glow.toString(16).padStart(6, '0')}`)
    .replaceAll('ACCENT', `#${creature.accent.toString(16).padStart(6, '0')}`);
  return `<svg class="guardian-art" viewBox="0 0 120 110" role="img" aria-label="${creature.name}, ${creature.species}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="aura-${creature.name}"><stop offset="0%" stop-color="#${creature.glow.toString(16).padStart(6, '0')}" stop-opacity=".34"/><stop offset="100%" stop-color="#${creature.glow.toString(16).padStart(6, '0')}" stop-opacity="0"/></radialGradient></defs><ellipse cx="60" cy="57" rx="54" ry="51" fill="url(#aura-${creature.name})"/><g class="guardian-creature">${drawing}</g><circle cx="18" cy="20" r="1.8" fill="#${creature.accent.toString(16).padStart(6, '0')}" opacity=".8"/><circle cx="101" cy="84" r="1.4" fill="#${creature.accent.toString(16).padStart(6, '0')}" opacity=".7"/></svg>`;
}

export function renderRealmGallery(root: HTMLElement): void {
  root.innerHTML = REALM_CREATURES.map((creature, index) => `
    <button class="guardian-card${index === 0 ? ' is-selected' : ''}" type="button" data-guardian-index="${index}" aria-pressed="${index === 0}" style="--guardian-glow:#${creature.glow.toString(16).padStart(6, '0')}">
      ${renderCreatureSvg(creature)}
      <span class="guardian-realm">${creature.realm.replace(/^The /, '')}</span>
      <strong>${creature.name}</strong>
      <span class="guardian-species">${creature.species}</span>
    </button>`).join('');

  const detail = document.getElementById('guardian-detail');
  const detailName = document.getElementById('guardian-detail-name');
  const detailSpecies = document.getElementById('guardian-detail-species');
  const detailDescription = document.getElementById('guardian-detail-description');
  const cards = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-guardian-index]'));

  const select = (index: number) => {
    const creature = REALM_CREATURES[index];
    if (!creature) return;
    cards.forEach((card, cardIndex) => {
      const selected = cardIndex === index;
      card.classList.toggle('is-selected', selected);
      card.setAttribute('aria-pressed', String(selected));
    });
    if (detailName) detailName.textContent = creature.name;
    if (detailSpecies) detailSpecies.textContent = creature.species;
    if (detailDescription) detailDescription.textContent = creature.description;
    if (detail) detail.style.setProperty('--guardian-glow', `#${creature.glow.toString(16).padStart(6, '0')}`);
  };

  cards.forEach((card, index) => card.addEventListener('click', () => select(index)));
  select(0);
}
