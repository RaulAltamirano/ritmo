// Backward-compatibility shim — consumers should migrate to useActivitiesStore directly.
export { useActivitiesStore as useActivities } from '@/stores/activities'
export type {
  CreateActivityPayload as CreateActivityData,
  UpdateActivityPayload as UpdateActivityData,
} from '@/types/activity'
