export type RealmCreature = {
  realm: string;
  name: string;
  species: string;
  form: 'jellyfish' | 'moth' | 'fox' | 'whale' | 'manta' | 'stag' | 'prism-fox' | 'cloud-koi' | 'scarab' | 'comet-dragon' | 'butterfly' | 'wisp';
  body: number;
  glow: number;
  accent: number;
  habitat: 'ocean' | 'sky' | 'meadow' | 'crystal' | 'sand' | 'cosmos' | 'twilight';
  description: string;
};

/** One original magical guardian concept for every planned realm. */
export const REALM_CREATURES: RealmCreature[] = [
  { realm: 'The Whispering Realm', name: 'Luma', species: 'Tideglow Jellyfish', form: 'jellyfish', body: 0x39aaff, glow: 0x168dff, accent: 0x9beaff, habitat: 'ocean', description: 'A bright-blue jellyfish whose quiet pulse lights the shore and guides lost memories home.' },
  { realm: 'The Dreaming Realm', name: 'Somni', species: 'Velvet Dream Moth', form: 'moth', body: 0xc49aff, glow: 0x9c75ef, accent: 0xffc7ed, habitat: 'sky', description: 'A lavender moth that scatters tiny dream-dust stars whenever it turns in the air.' },
  { realm: 'The Horizon Realm', name: 'Solari', species: 'Sunset Glassfox', form: 'fox', body: 0xffb47c, glow: 0xf28b87, accent: 0xffe2a0, habitat: 'meadow', description: 'A peach-gold fox whose glassy tail catches the last light of every sunset.' },
  { realm: 'The Realm of Echoes', name: 'Reson', species: 'Echoing Moonwhale', form: 'whale', body: 0x638cba, glow: 0x4e9dc8, accent: 0xc7e7ff, habitat: 'sky', description: 'A small floating whale whose luminous song leaves gentle rings of blue light in the air.' },
  { realm: 'The Abyssal Realm', name: 'Neri', species: 'Lanternwing Manta', form: 'manta', body: 0x13b9c8, glow: 0x087eac, accent: 0x9afff2, habitat: 'ocean', description: 'A graceful deep-sea manta with soft cyan lanterns along its wings.' },
  { realm: 'The Rootbound Realm', name: 'Thistle', species: 'Moss-Crowned Stag', form: 'stag', body: 0x6fb87c, glow: 0x397e57, accent: 0xc9e99a, habitat: 'meadow', description: 'A gentle forest stag with mossy antlers where tiny flowers bloom after rain.' },
  { realm: 'The Crystal Realm', name: 'Prisma', species: 'Prism-Tailed Fox', form: 'prism-fox', body: 0x8ebdff, glow: 0x638cff, accent: 0xe2f7ff, habitat: 'crystal', description: 'A crystalline fox whose tail refracts moonlight into quiet pastel rainbows.' },
  { realm: 'The Cloud Realm', name: 'Puffin', species: 'Cloud Koi', form: 'cloud-koi', body: 0xa7e5e5, glow: 0x72b8e0, accent: 0xffefcf, habitat: 'sky', description: 'A tiny koi that swims through clouds, leaving pearly bubbles that drift upward.' },
  { realm: 'Silent Sands', name: 'Saffra', species: 'Dune Glasswing Scarab', form: 'scarab', body: 0xd9a17e, glow: 0xb97986, accent: 0xffe1a3, habitat: 'sand', description: 'A glass-winged scarab that reveals ancient patterns in the sand with each slow wingbeat.' },
  { realm: 'The Celestial Realm', name: 'Astrael', species: 'Comet-Tailed Dragon', form: 'comet-dragon', body: 0x8f91ff, glow: 0x575bd1, accent: 0xe1c8ff, habitat: 'cosmos', description: 'A tiny star dragon that curls around constellations and trails a ribbon of stardust.' },
  { realm: 'The Seasonal Realm', name: 'Morrow', species: 'Fourfold Butterfly', form: 'butterfly', body: 0x9ccf9a, glow: 0x78a77c, accent: 0xf5ce85, habitat: 'meadow', description: 'A butterfly whose four wings carry spring blossoms, summer gold, autumn copper, and winter frost.' },
  { realm: 'The Fading Light Realm', name: 'Evensong', species: 'Dusk Wisp', form: 'wisp', body: 0x9a91d8, glow: 0x665aa8, accent: 0xf0c5d9, habitat: 'twilight', description: 'A floating twilight spirit that gathers the last gentle colours before night arrives.' },
];

export function getRealmCreature(realmName: string): RealmCreature | undefined {
  return REALM_CREATURES.find((creature) => creature.realm === realmName);
}
