import type { WeeklyPlan } from '~/types/training'
import { buildWeeklyPlanCsv } from '~/utils/exportWeeklyPlanCsv'
import { buildWeeklyPlanExcelXml } from '~/utils/exportWeeklyPlanExcel'
import { dateIso } from '~/utils/exportWeeklyPlanShared'

export type WeeklyExportFormat = 'csv' | 'excel'

export function weeklyExportFilename(
  weekStart: Date,
  format: WeeklyExportFormat
): string {
  const stamp = dateIso(weekStart)
  return format === 'excel'
    ? `ritmo-semana-${stamp}.xls`
    : `ritmo-semana-${stamp}.csv`
}

export function downloadWeeklyPlanExport(
  plan: WeeklyPlan,
  weekStart: Date,
  format: WeeklyExportFormat
): void {
  const isExcel = format === 'excel'
  const content = isExcel
    ? buildWeeklyPlanExcelXml(plan, weekStart)
    : buildWeeklyPlanCsv(plan, weekStart)
  const blob = new Blob([content], {
    type: isExcel
      ? 'application/vnd.ms-excel;charset=utf-8;'
      : 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = weeklyExportFilename(weekStart, format)
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
