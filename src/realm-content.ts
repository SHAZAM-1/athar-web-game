export type HiddenObject = {
  id: string;
  name: string;
  hint: string;
  x: number;
  y: number;
  symbol: string;
  xp: number;
};

export type RealmQuest = {
  id: string;
  realm: string;
  title: string;
  description: string;
  objects: HiddenObject[];
  completionXP: number;
};

export const REALM_QUESTS: RealmQuest[] = [
  { id: 'whispering-gentle-traces', realm: 'The Whispering Realm', title: 'Little Things in the Breeze', description: 'Let the wind reveal three quiet treasures.', completionXP: 100, objects: [
    { id: 'whispering-dewdrop', name: 'Dewdrop', hint: 'A tiny glow rests where the mist thins.', x: 0.18, y: 0.66, symbol: '✧', xp: 25 },
    { id: 'whispering-feather', name: 'Moon Feather', hint: 'Watch the air drift near the upper island.', x: 0.79, y: 0.18, symbol: '❋', xp: 25 },
    { id: 'whispering-seed', name: 'Sky Seed', hint: 'A seed is resting close to the island edge.', x: 0.86, y: 0.72, symbol: '✦', xp: 25 },
  ] },
  { id: 'dreaming-lost-lullaby', realm: 'The Dreaming Realm', title: 'A Lullaby in Pieces', description: 'Find three dream-chimes in the right order.', completionXP: 100, objects: [
    { id: 'dreaming-chime', name: 'Dream Chime', hint: 'Look where lavender clouds fold.', x: 0.2, y: 0.25, symbol: '♫', xp: 25 },
    { id: 'dreaming-petal', name: 'Sleep Petal', hint: 'A petal drifts beneath the moon.', x: 0.5, y: 0.7, symbol: '✿', xp: 25 },
    { id: 'dreaming-star', name: 'Pocket Star', hint: 'A small star hides near the horizon.', x: 0.82, y: 0.34, symbol: '✧', xp: 25 },
  ] },
  { id: 'horizon-wayfinder', realm: 'The Horizon Realm', title: 'The Wayfinder', description: 'Collect three signs carried by the warm breeze.', completionXP: 100, objects: [
    { id: 'horizon-shell', name: 'Sun Shell', hint: 'Search the sunlit edge.', x: 0.16, y: 0.7, symbol: '◌', xp: 25 },
    { id: 'horizon-compass', name: 'Little Compass', hint: 'Look where two paths meet.', x: 0.53, y: 0.32, symbol: '✥', xp: 25 },
    { id: 'horizon-ribbon', name: 'Wind Ribbon', hint: 'Follow the peach-coloured gust.', x: 0.83, y: 0.61, symbol: '〰', xp: 25 },
  ] },
  { id: 'echoes-kind-memory', realm: 'The Realm of Echoes', title: 'Kind Memories', description: 'Find three traces left by earlier travellers.', completionXP: 100, objects: [
    { id: 'echoes-acorn', name: 'Memory Acorn', hint: 'A memory glows beneath the trees.', x: 0.23, y: 0.6, symbol: '❋', xp: 25 },
    { id: 'echoes-bell', name: 'Echo Bell', hint: 'Listen near the quiet clearing.', x: 0.61, y: 0.2, symbol: '♧', xp: 25 },
    { id: 'echoes-thread', name: 'Silver Thread', hint: 'A thread catches the starlight.', x: 0.82, y: 0.68, symbol: '〰', xp: 25 },
  ] },
  { id: 'abyssal-lanterns', realm: 'The Abyssal Realm', title: 'Lanterns Below', description: 'Find three gentle lights in the underwater garden.', completionXP: 100, objects: [
    { id: 'abyssal-pearl', name: 'Moon Pearl', hint: 'A pearl rests among the blue currents.', x: 0.18, y: 0.4, symbol: '◉', xp: 25 },
    { id: 'abyssal-jelly', name: 'Glow Jelly', hint: 'Look for a soft glow in the deep.', x: 0.54, y: 0.68, symbol: '✧', xp: 25 },
    { id: 'abyssal-glass', name: 'Sea Glass', hint: 'The current has tucked something away.', x: 0.83, y: 0.29, symbol: '◇', xp: 25 },
  ] },
  { id: 'rootbound-heartwood', realm: 'The Rootbound Realm', title: 'The Rootbound Garden', description: 'Find three seeds connected by the old roots.', completionXP: 100, objects: [
    { id: 'rootbound-seed', name: 'Heart Seed', hint: 'A seed sleeps beneath the fern.', x: 0.2, y: 0.68, symbol: '❋', xp: 25 },
    { id: 'rootbound-moss', name: 'Soft Moss', hint: 'Look along the winding root.', x: 0.49, y: 0.28, symbol: '✿', xp: 25 },
    { id: 'rootbound-sap', name: 'Amber Sap', hint: 'A warm drop catches the green light.', x: 0.81, y: 0.62, symbol: '✦', xp: 25 },
  ] },
  { id: 'crystal-prism-song', realm: 'The Crystal Realm', title: 'A Prism’s Song', description: 'Find three crystal fragments that catch the light.', completionXP: 100, objects: [
    { id: 'crystal-prism', name: 'Tiny Prism', hint: 'Look where the light bends.', x: 0.19, y: 0.31, symbol: '◇', xp: 25 },
    { id: 'crystal-shard', name: 'Blue Shard', hint: 'A shard glimmers near the cave floor.', x: 0.5, y: 0.7, symbol: '✧', xp: 25 },
    { id: 'crystal-heart', name: 'Crystal Heart', hint: 'The brightest fragment hides in shade.', x: 0.82, y: 0.38, symbol: '✥', xp: 25 },
  ] },
  { id: 'cloud-postcards', realm: 'The Cloud Realm', title: 'Postcards from the Sky', description: 'Gather three notes carried between floating islands.', completionXP: 100, objects: [
    { id: 'cloud-note', name: 'Cloud Note', hint: 'A note drifts behind a cloud.', x: 0.18, y: 0.23, symbol: '♫', xp: 25 },
    { id: 'cloud-button', name: 'Pearl Button', hint: 'Look near the island’s soft shadow.', x: 0.52, y: 0.62, symbol: '◉', xp: 25 },
    { id: 'cloud-envelope', name: 'Sky Letter', hint: 'The breeze has tucked away a letter.', x: 0.84, y: 0.31, symbol: '✉', xp: 25 },
  ] },
  { id: 'silent-sands-footprints', realm: 'Silent Sands', title: 'Footprints of the Wind', description: 'Reveal three treasures beneath the drifting sand.', completionXP: 100, objects: [
    { id: 'sands-glass', name: 'Desert Glass', hint: 'A glint appears when the sand moves.', x: 0.18, y: 0.65, symbol: '◇', xp: 25 },
    { id: 'sands-bead', name: 'Rose Bead', hint: 'Look where the dunes meet.', x: 0.5, y: 0.3, symbol: '◉', xp: 25 },
    { id: 'sands-feather', name: 'Sand Feather', hint: 'A feather rests in the lee of a dune.', x: 0.83, y: 0.6, symbol: '❋', xp: 25 },
  ] },
  { id: 'celestial-orbit-keepers', realm: 'The Celestial Realm', title: 'Little Orbit Keepers', description: 'Find three tiny moons drifting out of their paths.', completionXP: 100, objects: [
    { id: 'celestial-moon', name: 'Pocket Moon', hint: 'A moonlet drifts just off its orbit.', x: 0.2, y: 0.3, symbol: '◔', xp: 25 },
    { id: 'celestial-comet', name: 'Comet Seed', hint: 'Follow the quiet arc of stardust.', x: 0.5, y: 0.66, symbol: '☄', xp: 25 },
    { id: 'celestial-ring', name: 'Saturn’s Ring', hint: 'A ring glimmers in the dark.', x: 0.82, y: 0.35, symbol: '◎', xp: 25 },
  ] },
  { id: 'seasonal-four-gifts', realm: 'The Seasonal Realm', title: 'Four Gentle Gifts', description: 'Find three keepsakes from the changing seasons.', completionXP: 100, objects: [
    { id: 'seasonal-leaf', name: 'Autumn Leaf', hint: 'A leaf rests between the seasons.', x: 0.19, y: 0.28, symbol: '❋', xp: 25 },
    { id: 'seasonal-flower', name: 'Spring Bloom', hint: 'A flower waits in a sun patch.', x: 0.5, y: 0.68, symbol: '✿', xp: 25 },
    { id: 'seasonal-snow', name: 'Snowflake', hint: 'A tiny flake glows in cool shade.', x: 0.82, y: 0.34, symbol: '❄', xp: 25 },
  ] },
  { id: 'fading-light-lantern-keepers', realm: 'The Fading Light Realm', title: 'Keepers of the Glow', description: 'Find three small lights before the evening settles.', completionXP: 100, objects: [
    { id: 'fading-wick', name: 'Lantern Wick', hint: 'A warm spark rests near the water.', x: 0.18, y: 0.65, symbol: '✧', xp: 25 },
    { id: 'fading-moth', name: 'Moon Moth', hint: 'A moth is drawn to the dim light.', x: 0.5, y: 0.29, symbol: '❋', xp: 25 },
    { id: 'fading-flame', name: 'Last Flame', hint: 'One last glow waits in the mist.', x: 0.83, y: 0.6, symbol: '♨', xp: 25 },
  ] },
];

export function getRealmQuest(realmName: string): RealmQuest | undefined {
  return REALM_QUESTS.find((quest) => quest.realm === realmName);
}

export function isQuestComplete(quest: RealmQuest, foundObjectIds: string[]): boolean {
  return quest.objects.every((object) => foundObjectIds.includes(object.id));
}
