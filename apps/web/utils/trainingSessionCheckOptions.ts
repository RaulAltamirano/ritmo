export const energyScaleOptions = [
  { value: 1, iconKey: 'battery-low', label: 'Very low' },
  { value: 2, iconKey: 'wind', label: 'Low' },
  { value: 3, iconKey: 'gauge', label: 'Medium' },
  { value: 4, iconKey: 'zap', label: 'High' },
  { value: 5, iconKey: 'flame', label: 'Very high' },
] as const

export const painScaleOptions = [
  { value: 1, iconKey: 'sparkles', label: 'None' },
  { value: 2, iconKey: 'wind', label: 'Mild' },
  { value: 3, iconKey: 'gauge', label: 'Moderate' },
  { value: 4, iconKey: 'alert-circle', label: 'Strong' },
  { value: 5, iconKey: 'flame', label: 'Severe' },
] as const
