export type RealmLandscape = {
  realm: string;
  farLand: number;
  nearLand: number;
  grassPrimary: number;
  grassAlternate: number;
  grainPrimary: number;
  grainAlternate: number;
};

/**
 * Shared meadow palette contracts for all planned realms. Each realm can keep
 * the comforting moving-grass / golden-grain language while its colours and
 * distant-land silhouettes retain a distinct identity.
 */
export const REALM_LANDSCAPES: RealmLandscape[] = [
  { realm: 'The Whispering Realm', farLand: 0x284d58, nearLand: 0x173b43, grassPrimary: 0x76bd9b, grassAlternate: 0x5ca78a, grainPrimary: 0xf1d98a, grainAlternate: 0xe6c96f },
  { realm: 'The Dreaming Realm', farLand: 0x655b83, nearLand: 0x393754, grassPrimary: 0xa59acb, grassAlternate: 0x827eb3, grainPrimary: 0xf1d4a1, grainAlternate: 0xd8b5df },
  { realm: 'The Horizon Realm', farLand: 0xa86f60, nearLand: 0x654a4c, grassPrimary: 0xd4a071, grassAlternate: 0xb77d65, grainPrimary: 0xf8d47f, grainAlternate: 0xe9b95e },
  { realm: 'The Realm of Echoes', farLand: 0x354c68, nearLand: 0x1e304b, grassPrimary: 0x638a91, grassAlternate: 0x496c7d, grainPrimary: 0xd8d09b, grainAlternate: 0xb8b780 },
  { realm: 'The Abyssal Realm', farLand: 0x205a70, nearLand: 0x123746, grassPrimary: 0x4cafa9, grassAlternate: 0x368d9b, grainPrimary: 0xd9e78a, grainAlternate: 0x8bd7c5 },
  { realm: 'The Rootbound Realm', farLand: 0x315a43, nearLand: 0x193b30, grassPrimary: 0x70ad6d, grassAlternate: 0x4e8956, grainPrimary: 0xe2c56f, grainAlternate: 0xb7d17d },
  { realm: 'The Crystal Realm', farLand: 0x4c5685, nearLand: 0x292f5c, grassPrimary: 0x829fc8, grassAlternate: 0x6c82b0, grainPrimary: 0xe9d5a2, grainAlternate: 0xc7b7e8 },
  { realm: 'The Cloud Realm', farLand: 0x648b9d, nearLand: 0x385d79, grassPrimary: 0x9acdc2, grassAlternate: 0x72b1b1, grainPrimary: 0xf5e3a5, grainAlternate: 0xd3d6a0 },
  { realm: 'Silent Sands', farLand: 0x9a766d, nearLand: 0x644c55, grassPrimary: 0xb9a17d, grassAlternate: 0x92886f, grainPrimary: 0xf4d17c, grainAlternate: 0xe6b45f },
  { realm: 'The Celestial Realm', farLand: 0x44456f, nearLand: 0x242747, grassPrimary: 0x6c8caa, grassAlternate: 0x526b9a, grainPrimary: 0xe8d18c, grainAlternate: 0xbeb4ee },
  { realm: 'The Seasonal Realm', farLand: 0x58745b, nearLand: 0x354b43, grassPrimary: 0x88b878, grassAlternate: 0x739d72, grainPrimary: 0xe8bf68, grainAlternate: 0xd6a15f },
  { realm: 'The Fading Light Realm', farLand: 0x66577d, nearLand: 0x35314f, grassPrimary: 0x8c88b4, grassAlternate: 0x696d9a, grainPrimary: 0xf1ce87, grainAlternate: 0xd6a875 },
];

export function getRealmLandscape(realmName: string): RealmLandscape | undefined {
  return REALM_LANDSCAPES.find((landscape) => landscape.realm === realmName);
}
