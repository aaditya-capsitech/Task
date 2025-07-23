export const BusinessStatus = {
  All: "All",
  Active: 'Active',
  Inactive: 'Inactive',
} as const;

export type BusinessStatus = keyof typeof BusinessStatus;

export const FilterCriteria = {
  BusinessType: 'businessType',
} as const;

export type FilterCriteriaType = typeof FilterCriteria[keyof typeof FilterCriteria];
