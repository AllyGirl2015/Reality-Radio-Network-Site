const fs = require('fs');
const path = require('path');

const SINGLES_FILE = path.join(process.cwd(), 'data', 'singles.json');

const mapping = {
  // Jonathan Gold - America's Changed
  "America's Changed": 'https://square.link/u/qdNf4PIB',
  'Goodbye Mainstreet': 'https://square.link/u/HRcO4W2v',
  'She Wore Red, I Wore Blue': 'https://square.link/u/WW26LUbW',
  'God Blessed the Silent Ones': 'https://square.link/u/4IAqR0fw',
  'Gas Station Prayers': 'https://square.link/u/8KDMl25W',
  'Generations': 'https://square.link/u/NvPmGPW9',
  'Country Fireflies': 'https://square.link/u/TWAmxuVW',
  'Tractor Man': 'https://square.link/u/sU1NncHt',
  'Young Ones': 'https://square.link/u/RIxG1Riu',
  'Unspoken Hero': 'https://square.link/u/8BIPjGnt',

  // Heartfelt Rebellion album
  'Heartfelt Rebellion': 'https://square.link/u/UPjc3HBj',
  'Country Bonfire': 'https://square.link/u/l6dpRQ0Z',
  'Screens': 'https://square.link/u/siw5dlTV',
  'Forgotten Sons': 'https://square.link/u/GEBSbUcq',
  'Chaos Country': 'https://square.link/u/tBcqCQMo',
  'Lifeline': 'https://square.link/u/oC29uWqE',
  'Connections': 'https://square.link/u/ve5ZQQI6',
  'Country Style': 'https://square.link/u/x1wjS3b3',
  'Civilization Outlaw': 'https://square.link/u/ZIse5K8t',
  'Religious Truth': 'https://square.link/u/Qp0IOaRb',
  'Unspoken Words': 'https://square.link/u/G4DEcfbR',
  'Truth is What You Make It': 'https://square.link/u/rLIuYpnS',
  'Empathy': 'https://square.link/u/lu3tLA9A',

  // Golden Heartbreak Vol 1
  'Back When We Fell': 'https://square.link/u/uYE5moPN',
  'City Girl': 'https://square.link/u/1tjYtYPN',
  'Country Looks': 'https://square.link/u/1ysdYMgr',
  'Tractor Heart': 'https://square.link/u/GiO5kPS0',
  "Country Lovin'": 'https://square.link/u/77ekVWyU',
  'Backroad Love': 'https://square.link/u/KhYzcHvV',
  'Country Tangled': 'https://square.link/u/vyzwo8Ie',
  'The Stash': 'https://square.link/u/XTXMAe6r',
  'Truckbed': 'https://square.link/u/jFkndmY3',
  'Night on the Farm': 'https://square.link/u/luYbBSDs',
  'Innocent Love': 'https://square.link/u/2t3bLjQW',
  'Country Breakup': 'https://square.link/u/sfVSSC6A',

  // Golden Heartbreak Vol 2
  'I Choose the Truck': 'https://square.link/u/SqNdCuZY',
  'Muddy Mistake': 'https://square.link/u/vydRQkMC',
  'Drunk Love': 'https://square.link/u/67npptrL',
  'The Barn is a Secret': 'https://square.link/u/AfE196qH',
  'The Old You and Me': 'https://square.link/u/8CnpJsxV',
  'Heartbreak Song': 'https://square.link/u/2b0wHaKX',
  'Young Love': 'https://square.link/u/qhuVQoex',
  'Family Livin’': 'https://square.link/u/JZLrlG18',
  'Tractor Tango': 'https://square.link/u/QMB00ScG',
  'Golden Heartbreak': 'https://square.link/u/SrsplBaX',

  // Kaira Heartfelt - Barefoot Supernova
  'Small Town Supernova': 'https://square.link/u/v8fceqEn',
  'Country Girl': 'https://square.link/u/TVQ5TDWc',
  'Barefoot Change': 'https://square.link/u/31P4DIG2',
  'Lovestruck': 'https://square.link/u/RgDfvCre',
  'Evil Love': 'https://square.link/u/vDLUi3SQ',
  'He Cheated (Main)': 'https://square.link/u/xnPnVNfT',
  'His Best Was Better': 'https://square.link/u/hKfPmHO1',
  'Beautiful Broken Love (Ft. Johnathan Gold)': 'https://square.link/u/p5EdP8zq',
  'Firefly Nights': 'https://square.link/u/gYYw2mFt',
  'Steering Faith': 'https://square.link/u/pbl5vkdy',
  "Daddy's Girl": 'https://square.link/u/1UOcn2AE',
  'Colder Nights': 'https://square.link/u/yxaxNrV0',
  'He Cheated (Slow Alt)': 'https://square.link/u/vrJRmSeH',
  'Small Town Supernova (Slow Alt)': 'https://square.link/u/YeuNyhSS',

  // Stellar Love
  'Lustful Love': 'https://square.link/u/uCNgvD61',
  'Love Killer': 'https://square.link/u/A9lcKAtJ',
  'The Stars Above': 'https://square.link/u/KY87KnDq',
  'Take My Love': 'https://square.link/u/A6Z6eiMv',
  'Rebound': 'https://square.link/u/JHptln9y',
  'Heart Call': 'https://square.link/u/BFzneRRf',
  'Catcall': 'https://square.link/u/RxtzKFdm',
  'Fisher': 'https://square.link/u/oZVYA111',
  'Confidential': 'https://square.link/u/UTEys2hR',
  'Chaos Love': 'https://square.link/u/J85qejie',
  "Devil's Number": 'https://square.link/u/Q1xXdWqV',

  // Mathew Cage - Shattered Peaces
  'World of Gold': 'https://square.link/u/sFZgKz0H',
  'Fractured Signal': 'https://square.link/u/9i1bEiGh',
  'The Line Was Crossed': 'https://square.link/u/kUW8TkQu',
  'Echoes of the Cage': 'https://square.link/u/CIdphTPl',
  'Shattered': 'https://square.link/u/2Kwr9z6y',
  'Broken Peace': 'https://square.link/u/8uxmxecL',
  'Fallen Flag': 'https://square.link/u/vXnEKB2q',
  'Soulbound': 'https://square.link/u/gtVa8B9U',
  'Corruption': 'https://square.link/u/c0s8wz02',
  'Opening': 'https://square.link/u/fUICLs2i',
  "In the Devil's Name I Pray": 'https://square.link/u/yrSvh9Jg',

  // High Hit
  'Scraps': 'https://square.link/u/SGR5pleF',
  'One Drink': 'https://square.link/u/BvPUwD9D',
  'Fallen Dust': 'https://square.link/u/w7AoMqVu',
  'Drown it Out': 'https://square.link/u/ySwHhOaF',
  'Chronicles': 'https://square.link/u/6WsGeSlh',
  'Reflection': 'https://square.link/u/lgrR0Zgr',
  'Hollow Leaning': 'https://square.link/u/aFUCt7W9',
  'Youth': 'https://square.link/u/nTanOuzg',
  'High Hit': 'https://square.link/u/yd8WBKGr',
  'Made Us': 'https://square.link/u/lqjnagJn',

  // Chronix - Descend
  'Starting Line': 'https://square.link/u/zpxtfOAv',
  'Power of the Few': 'https://square.link/u/cbUd7WFb',
  'Rags No More': 'https://square.link/u/OT1Igwz0',
  'Hate No More': 'https://square.link/u/ww5flTua',
  'Mark Me Down': 'https://square.link/u/YLDBzFse',
  'No Mistakes': 'https://square.link/u/FSCacaiZ',
  'Love No More': 'https://square.link/u/0buijFyt',
  'Kinship': 'https://square.link/u/kBFjAzRQ',
  'The Skies': 'https://square.link/u/VanCLWmY',
  'Descend': 'https://square.link/u/21Utru2N'
};

function readSingles() {
  return JSON.parse(fs.readFileSync(SINGLES_FILE, 'utf8'));
}

function writeSingles(data) {
  fs.writeFileSync(SINGLES_FILE, JSON.stringify(data, null, 2), 'utf8');
}

const singles = readSingles();
let updated = 0;
for (const s of singles) {
  const title = s.title;
  if (mapping[title]) {
    s.buyLink = mapping[title];
    updated++;
  }
}

writeSingles(singles);
console.log(`Updated ${updated} singles buyLink(s).`);
