import type { DailyCheckin } from '@prisma/client'
import prisma from '../../../core/database/prisma.js'
import {
  getCalendarDateForUser,
  parseCalendarDateString,
} from '../../../core/utils/calendarDate.js'

export class DailyCheckinService {
  async getByCalendarDate(
    userId: string,
    calendarDateParam: string,
  ): Promise<DailyCheckin | null> {
    const calendarDate = parseCalendarDateString(calendarDateParam)
    return prisma.dailyCheckin.findUnique({
      where: {
        userId_calendarDate: { userId, calendarDate },
      },
    })
  }

  /**
   * Crea o actualiza el check-in del día civil del usuario.
   *
   * El servidor deriva `calendarDate` desde la zona horaria del usuario; el
   * cliente no envía fecha (spec §B2, decisión de 2026-04-22: autoridad del
   * servidor sobre el día civil para evitar inconsistencias por relojes
   * desviados).
   */
  async upsert(
    userId: string,
    userTimezone: string,
    body: { energy: number; stress: number },
  ): Promise<DailyCheckin> {
    const calendarDate = getCalendarDateForUser(new Date(), userTimezone)

    return prisma.dailyCheckin.upsert({
      where: {
        userId_calendarDate: { userId, calendarDate },
      },
      create: {
        userId,
        calendarDate,
        energy: body.energy,
        stress: body.stress,
      },
      update: {
        energy: body.energy,
        stress: body.stress,
      },
    })
  }
}
