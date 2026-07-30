import type { WeeklyPlan } from '~/types/training'
import {
  DELOAD_TIP,
  HOW_TO_APPLY,
  PROGRESSION_TIP,
  RIR_DEFINITION,
  RPE_DEFINITION,
  escapeXml,
  trainingDayStyleId,
  trainingSessionBanner,
} from '~/utils/exportWeeklyPlanShared'
import { addDays, formatWeekLabel } from '~/utils/trainingWeek'

function xmlCell(
  value: string,
  opts: { type?: 'String' | 'Number'; style?: string; mergeAcross?: number } = {}
): string {
  const type = opts.type ?? 'String'
  const styleAttr = opts.style ? ` ss:StyleID="${opts.style}"` : ''
  const mergeAttr =
    opts.mergeAcross !== undefined
      ? ` ss:MergeAcross="${opts.mergeAcross}"`
      : ''
  return `<Cell${styleAttr}${mergeAttr}><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`
}

function xmlRow(cells: string, height?: number): string {
  const heightAttr = height ? ` ss:Height="${height}"` : ''
  return `<Row${heightAttr}>${cells}</Row>`
}

const EXCEL_STYLES = ` <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="11"/>
  </Style>
  <Style ss:ID="Label">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
   <Interior ss:Color="#F0EEEA" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="ColHeader">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
   <Interior ss:Color="#E8E6E2" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="ColHeaderCenter">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
   <Interior ss:Color="#E8E6E2" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Center">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="DayUpper">
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1"/>
   <Interior ss:Color="#D8F3EF" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="DayLower">
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1"/>
   <Interior ss:Color="#F5E6D8" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Section">
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1"/>
   <Interior ss:Color="#F0EEEA" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Wrap">
   <Alignment ss:Vertical="Center" ss:WrapText="1"/>
  </Style>
 </Styles>`

/** SpreadsheetML with the same Día 1–4 tables as the source routine. */
export function buildWeeklyPlanExcelXml(
  plan: WeeklyPlan,
  weekStart: Date
): string {
  const weekEnd = addDays(weekStart, 6)
  const weekLabel = formatWeekLabel(weekStart, weekEnd)
  const sessions = [...plan.days].sort((a, b) => a.dayNumber - b.dayNumber)
  const rows: string[] = []

  rows.push(
    xmlRow(
      xmlCell('Plan', { style: 'Label' }) + xmlCell(plan.title, { mergeAcross: 3 })
    )
  )
  rows.push(
    xmlRow(
      xmlCell('Programa', { style: 'Label' }) +
        xmlCell(plan.programLabel, { mergeAcross: 3 })
    )
  )
  rows.push(
    xmlRow(
      xmlCell('Semana', { style: 'Label' }) + xmlCell(weekLabel, { mergeAcross: 3 })
    )
  )
  rows.push(xmlRow(''))

  for (const day of sessions) {
    rows.push(
      xmlRow(
        xmlCell(trainingSessionBanner(day), {
          style: trainingDayStyleId(day.focus),
          mergeAcross: 4,
        }),
        22
      )
    )
    rows.push(
      xmlRow(
        xmlCell('Bloque', { style: 'ColHeaderCenter' }) +
          xmlCell('Ejercicio', { style: 'ColHeader' }) +
          xmlCell('Series y Repeticiones', { style: 'ColHeader' }) +
          xmlCell('RIR Objetivo', { style: 'ColHeaderCenter' }) +
          xmlCell('RPE', { style: 'ColHeaderCenter' })
      )
    )

    for (const exercise of day.exercises) {
      rows.push(
        xmlRow(
          xmlCell(exercise.block, { style: 'Center' }) +
            xmlCell(exercise.name) +
            xmlCell(exercise.setsReps) +
            xmlCell(exercise.targetRir, { style: 'Center' }) +
            xmlCell(exercise.rpe, { style: 'Center' })
        )
      )
    }

    rows.push(xmlRow(''))
  }

  rows.push(
    xmlRow(
      xmlCell('Guía rápida: RIR y RPE', { style: 'Section', mergeAcross: 4 })
    )
  )
  rows.push(
    xmlRow(
      xmlCell('Qué es RIR', { style: 'Label' }) +
        xmlCell(RIR_DEFINITION, { style: 'Wrap', mergeAcross: 3 })
    )
  )
  rows.push(
    xmlRow(
      xmlCell('Qué es RPE', { style: 'Label' }) +
        xmlCell(RPE_DEFINITION, { style: 'Wrap', mergeAcross: 3 })
    )
  )
  rows.push(
    xmlRow(
      xmlCell('Cómo aplicarlos', { style: 'Label' }) +
        xmlCell(HOW_TO_APPLY, { style: 'Wrap', mergeAcross: 3 })
    )
  )
  rows.push(xmlRow(''))
  rows.push(
    xmlRow(
      xmlCell('📈 Reglas de Progresión y Descarga', {
        style: 'Section',
        mergeAcross: 4,
      })
    )
  )
  rows.push(
    xmlRow(
      xmlCell('Progresión', { style: 'Label' }) +
        xmlCell(PROGRESSION_TIP, { style: 'Wrap', mergeAcross: 3 })
    )
  )
  rows.push(
    xmlRow(
      xmlCell('Descarga (Deload)', { style: 'Label' }) +
        xmlCell(DELOAD_TIP, { style: 'Wrap', mergeAcross: 3 })
    )
  )

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
${EXCEL_STYLES}
 <Worksheet ss:Name="Semana">
  <Table ss:DefaultColumnWidth="80">
   <Column ss:Index="1" ss:Width="70"/>
   <Column ss:Index="2" ss:Width="180"/>
   <Column ss:Index="3" ss:Width="200"/>
   <Column ss:Index="4" ss:Width="90"/>
   <Column ss:Index="5" ss:Width="60"/>
   ${rows.join('\n   ')}
  </Table>
 </Worksheet>
</Workbook>`
}
