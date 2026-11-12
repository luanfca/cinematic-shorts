import { Look } from '../engine';

/**
 * O CADERNO DA MORTE — the cast. Original faces on the studio rig, one identity per person for the whole series.
 *
 *  - Lucas: the protagonist. Teal jacket, a side-swept fringe (new `fringe` extra), a dark messenger bag. He must
 *    read as an ordinary young man in the first shot and as the only lit face in a dark room in the last one.
 *  - O viajante: the man who leaves the notebook. Older, dark olive coat, grey beard. Calm; he never hurries.
 *  - A apresentadora: the live anchor. Navy blazer, red accent, a bob; she is the voice of the real world.
 *  - O criminoso: the man on the broadcast. Grey hoodie, buzzed hair; a face the audience can recognise from a photo.
 */
export const LUCAS: Look = {
  skin: '#D8A077', skinShade: '#BE8560', hand: '#D8A077',
  jacket: '#2E6D74', jacketShade: '#23545A', accent: '#E8B45C',
  limb: '#2E3A46', sleeve: '#3C818A', line: '#0C1116', shoe: '#20242C',
  face: '#1D2033', hair: '#231916', extra: 'fringe',
};

export const VIAJANTE: Look = {
  skin: '#B08A66', skinShade: '#997454', hand: '#B08A66',
  jacket: '#2A2F2A', jacketShade: '#1F231F', accent: '#6B7258',
  limb: '#23262A', sleeve: '#3A4038', line: '#0B0D0C', shoe: '#141614',
  face: '#171A16', hair: '#6A6258', extra: 'beard',
};

export const APRESENTADORA: Look = {
  skin: '#E8C39B', skinShade: '#D0A87E', hand: '#E8C39B',
  jacket: '#26324A', jacketShade: '#1C2638', accent: '#C0303C',
  limb: '#1E2430', sleeve: '#33425E', line: '#0A0D14', shoe: '#14161C',
  face: '#1D2033', hair: '#3A2620', extra: 'bob',
};

export const CRIMINOSO: Look = {
  skin: '#B98A62', skinShade: '#9E7050', hand: '#B98A62',
  jacket: '#3E3A38', jacketShade: '#2E2B29', accent: '#C24A3A',
  limb: '#2A2A30', sleeve: '#4A4642', line: '#0D0C0E', shoe: '#16151A',
  face: '#1D2033', hair: '#1A1412', extra: 'buzz',
};
