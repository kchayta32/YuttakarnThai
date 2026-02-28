import { CAMPAIGN1_MAPS } from '../campaign1/data/maps.js';
import { CAMPAIGN2_MAPS } from '../campaign2/data/maps.js';

export const MAPS = {
    ...CAMPAIGN1_MAPS,
    ...CAMPAIGN2_MAPS
};

// Campaign mission list for UI
export const CAMPAIGN_MISSIONS = {
    white_elephant: [
        'campaign1_mission1',
        'campaign1_mission2',
        'campaign1_mission3',
        'campaign1_mission4',
        'campaign1_mission5',
        'campaign1_mission6',
        'campaign1_mission7',
        'campaign1_mission8'
    ],
    tha_din_daeng: [
        'campaign2_mission1',
        'campaign2_mission2',
        'campaign2_mission3',
        'campaign2_mission4'
    ]
};

export const CURRENT_MAP = 'campaign1_mission1';
