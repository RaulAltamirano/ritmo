-- CreateEnum
CREATE TYPE "public"."TrainingLevel" AS ENUM ('basic', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "public"."TrainingGoal" AS ENUM ('hypertrophy', 'strength', 'recomposition', 'health');

-- CreateEnum
CREATE TYPE "public"."EquipmentProfile" AS ENUM ('full_gym', 'limited_machines', 'dumbbells_cables', 'home');

-- CreateEnum
CREATE TYPE "public"."BlockPhase" AS ENUM ('accumulation', 'deload');

-- CreateEnum
CREATE TYPE "public"."DayFocus" AS ENUM ('upper', 'lower');

-- CreateEnum
CREATE TYPE "public"."TrainingWeekStatus" AS ENUM ('draft', 'applied');

-- CreateEnum
CREATE TYPE "public"."ExerciseFamily" AS ENUM ('press_horizontal', 'press_inclinado', 'aduccion_horizontal', 'press_vertical', 'elevacion_lateral', 'deltoides_posterior', 'jalon', 'remo', 'pullover', 'extension_lumbar', 'sentadilla_bilateral', 'sentadilla_unilateral', 'bisagra_cadera', 'empuje_cadera', 'extension_rodilla', 'curl_femoral', 'aductor', 'abductor', 'pantorrilla', 'curl_biceps', 'extension_triceps', 'core', 'face_pull');

-- CreateTable
CREATE TABLE "public"."exercises" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "family" "public"."ExerciseFamily" NOT NULL,
    "equipment" TEXT[],
    "isCore" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."program_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "level" "public"."TrainingLevel" NOT NULL,
    "daysPerWeek" INTEGER NOT NULL,
    "sourceFile" TEXT NOT NULL,

    CONSTRAINT "program_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."program_template_days" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "focus" "public"."DayFocus" NOT NULL,
    "weekday" INTEGER,

    CONSTRAINT "program_template_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."program_template_slots" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "block" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "setsReps" TEXT NOT NULL,
    "targetRir" TEXT NOT NULL,
    "targetRpe" TEXT NOT NULL,
    "emphasis" TEXT,

    CONSTRAINT "program_template_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" "public"."TrainingLevel" NOT NULL,
    "daysPerWeek" INTEGER NOT NULL,
    "minutesPerSession" INTEGER NOT NULL,
    "equipment" "public"."EquipmentProfile" NOT NULL,
    "goal" "public"."TrainingGoal" NOT NULL,
    "hasActiveInjury" BOOLEAN NOT NULL DEFAULT false,
    "injuriesNotes" TEXT,
    "restrictions" TEXT,
    "understandsRir" BOOLEAN NOT NULL DEFAULT false,
    "programTemplateId" TEXT,
    "blockPhase" "public"."BlockPhase" NOT NULL DEFAULT 'accumulation',
    "weekInBlock" INTEGER NOT NULL DEFAULT 1,
    "blockLengthWeeks" INTEGER NOT NULL DEFAULT 4,
    "historyWindowWeeks" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "training_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_weeks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "status" "public"."TrainingWeekStatus" NOT NULL DEFAULT 'draft',
    "profileSnapshot" JSONB NOT NULL,
    "programTemplateId" TEXT NOT NULL,
    "blockPhase" "public"."BlockPhase" NOT NULL,
    "weekInBlock" INTEGER NOT NULL,
    "summary" TEXT,
    "substitutions" JSONB,
    "source" TEXT NOT NULL DEFAULT 'wfitness_v1',
    "warning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_days" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "focus" "public"."DayFocus" NOT NULL,
    "weekday" INTEGER NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "training_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_day_exercises" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "block" TEXT NOT NULL,
    "setsReps" TEXT NOT NULL,
    "targetRir" TEXT NOT NULL,
    "targetRpe" TEXT NOT NULL,
    "emphasis" TEXT,

    CONSTRAINT "training_day_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exercise_set_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayKey" VARCHAR(10) NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "note" TEXT,
    "sets" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_set_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_session_checks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayKey" VARCHAR(10) NOT NULL,
    "startStatus" TEXT NOT NULL DEFAULT 'none',
    "endStatus" TEXT NOT NULL DEFAULT 'none',
    "start" JSONB,
    "end" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_session_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exercises_slug_key" ON "public"."exercises"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "program_templates_code_key" ON "public"."program_templates"("code");

-- CreateIndex
CREATE UNIQUE INDEX "program_template_days_templateId_dayNumber_key" ON "public"."program_template_days"("templateId", "dayNumber");

-- CreateIndex
CREATE INDEX "program_template_slots_exerciseId_idx" ON "public"."program_template_slots"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "program_template_slots_dayId_sortOrder_key" ON "public"."program_template_slots"("dayId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "training_profiles_userId_key" ON "public"."training_profiles"("userId");

-- CreateIndex
CREATE INDEX "training_profiles_programTemplateId_idx" ON "public"."training_profiles"("programTemplateId");

-- CreateIndex
CREATE INDEX "training_weeks_userId_weekStart_idx" ON "public"."training_weeks"("userId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "training_weeks_userId_weekStart_key" ON "public"."training_weeks"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "training_days_weekId_date_idx" ON "public"."training_days"("weekId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "training_days_weekId_dayNumber_key" ON "public"."training_days"("weekId", "dayNumber");

-- CreateIndex
CREATE INDEX "training_day_exercises_exerciseId_idx" ON "public"."training_day_exercises"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "training_day_exercises_dayId_sortOrder_key" ON "public"."training_day_exercises"("dayId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_set_logs_userId_dayKey_exerciseId_key" ON "public"."exercise_set_logs"("userId", "dayKey", "exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "training_session_checks_userId_dayKey_key" ON "public"."training_session_checks"("userId", "dayKey");

-- AddForeignKey
ALTER TABLE "public"."program_template_days" ADD CONSTRAINT "program_template_days_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."program_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."program_template_slots" ADD CONSTRAINT "program_template_slots_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "public"."program_template_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."program_template_slots" ADD CONSTRAINT "program_template_slots_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_profiles" ADD CONSTRAINT "training_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_profiles" ADD CONSTRAINT "training_profiles_programTemplateId_fkey" FOREIGN KEY ("programTemplateId") REFERENCES "public"."program_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_weeks" ADD CONSTRAINT "training_weeks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_weeks" ADD CONSTRAINT "training_weeks_programTemplateId_fkey" FOREIGN KEY ("programTemplateId") REFERENCES "public"."program_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_days" ADD CONSTRAINT "training_days_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "public"."training_weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_day_exercises" ADD CONSTRAINT "training_day_exercises_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "public"."training_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_day_exercises" ADD CONSTRAINT "training_day_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exercise_set_logs" ADD CONSTRAINT "exercise_set_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exercise_set_logs" ADD CONSTRAINT "exercise_set_logs_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_session_checks" ADD CONSTRAINT "training_session_checks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
