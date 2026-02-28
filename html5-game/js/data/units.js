import { CAMPAIGN1_UNITS, CAMPAIGN1_BUILDINGS } from '../campaign1/data/units.js';
import { CAMPAIGN2_UNITS, CAMPAIGN2_BUILDINGS } from '../campaign2/data/units.js';

export const UNIT_TYPES = {
    ...CAMPAIGN1_UNITS,
    ...CAMPAIGN2_UNITS
};

export const BUILDING_TYPES = {
    ...CAMPAIGN1_BUILDINGS,
    ...CAMPAIGN2_BUILDINGS
};
