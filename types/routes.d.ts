export interface RouteMeta {
  requiresAuth?: boolean
  title?: string
  layout?: string
}

export interface RouteConfig {
  path: string
  component: string
  meta?: RouteMeta
  children?: RouteConfig[]
}
