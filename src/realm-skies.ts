export type SkyStyle = {
  realm: string;
  upper: number;
  horizon: number;
  stars: number;
  aurora: number;
  auroraAccent: number;
  moon: number;
  celestial: 'moon' | 'sun' | 'ringed-planet' | 'none';
  skyMood: 'aurora' | 'dream' | 'sunset' | 'echo' | 'abyss' | 'forest' | 'crystal' | 'cloud' | 'desert' | 'orbit' | 'seasons' | 'twilight';
};

/** Distinct, peaceful sky identities for the twelve planned Athar realms. */
export const REALM_SKIES: SkyStyle[] = [
  { realm: 'The Whispering Realm', upper: 0x101b3b, horizon: 0x526d8b, stars: 0xdaf8ff, aurora: 0x4ce4cf, auroraAccent: 0x8e9dff, moon: 0xffd7b0, celestial: 'moon', skyMood: 'aurora' },
  { realm: 'The Dreaming Realm', upper: 0x29204f, horizon: 0xb17ab8, stars: 0xffe8fa, aurora: 0xc49aff, auroraAccent: 0xff9dcf, moon: 0xffd5ef, celestial: 'moon', skyMood: 'dream' },
  { realm: 'The Horizon Realm', upper: 0x633b62, horizon: 0xf5ae88, stars: 0xfff1d5, aurora: 0xffb47c, auroraAccent: 0xffd77c, moon: 0xffe2b2, celestial: 'sun', skyMood: 'sunset' },
  { realm: 'The Realm of Echoes', upper: 0x101e3a, horizon: 0x354e70, stars: 0xc7ddff, aurora: 0x638cba, auroraAccent: 0xa5b7f5, moon: 0xd6e6ff, celestial: 'moon', skyMood: 'echo' },
  { realm: 'The Abyssal Realm', upper: 0x03152e, horizon: 0x07516c, stars: 0x8ff8ff, aurora: 0x13d6e4, auroraAccent: 0x3f8fff, moon: 0x9af7f1, celestial: 'none', skyMood: 'abyss' },
  { realm: 'The Rootbound Realm', upper: 0x172b29, horizon: 0x58785a, stars: 0xe5ffd0, aurora: 0x83c77a, auroraAccent: 0xe1c97b, moon: 0xffe2aa, celestial: 'moon', skyMood: 'forest' },
  { realm: 'The Crystal Realm', upper: 0x101b45, horizon: 0x5a7eb0, stars: 0xe2f5ff, aurora: 0x77d8ff, auroraAccent: 0xc4a9ff, moon: 0xf3f1ff, celestial: 'ringed-planet', skyMood: 'crystal' },
  { realm: 'The Cloud Realm', upper: 0x3b6489, horizon: 0xd7c7e4, stars: 0xfff6dc, aurora: 0xa7e5e5, auroraAccent: 0xf5d8ad, moon: 0xffedcf, celestial: 'sun', skyMood: 'cloud' },
  { realm: 'Silent Sands', upper: 0x3d2948, horizon: 0xd58f86, stars: 0xffe8c6, aurora: 0xe6a3a1, auroraAccent: 0xf5d18a, moon: 0xffd4ae, celestial: 'moon', skyMood: 'desert' },
  { realm: 'The Celestial Realm', upper: 0x070d2d, horizon: 0x343f79, stars: 0xf1e8ff, aurora: 0x7d8dff, auroraAccent: 0xe1a9ff, moon: 0xe4dcff, celestial: 'ringed-planet', skyMood: 'orbit' },
  { realm: 'The Seasonal Realm', upper: 0x1c2c42, horizon: 0xa47d77, stars: 0xfff0d9, aurora: 0x9ccf9a, auroraAccent: 0xe8b779, moon: 0xffe0b5, celestial: 'moon', skyMood: 'seasons' },
  { realm: 'The Fading Light Realm', upper: 0x1a1839, horizon: 0x8b7194, stars: 0xe6e3ff, aurora: 0x9a91d8, auroraAccent: 0xf0c5a1, moon: 0xffd7b6, celestial: 'moon', skyMood: 'twilight' },
];

export function getRealmSky(realmName: string): SkyStyle | undefined {
  return REALM_SKIES.find((sky) => sky.realm === realmName);
}
