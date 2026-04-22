# Ritmo — Product Knowledge Base

> Last updated: 2026-04-19

---

## What is Ritmo?

Ritmo is a productivity system that aligns work with the body's natural biological rhythms. It does not only ask _what to do_, but _when to do it_ to get the best possible result based on the energy and cognitive capacity available at each moment of the day.

---

## The 8 Circadian Phases

The day is divided into 8 phases. Each one represents a distinct profile of energy, focus, and mental capacity. The system automatically detects which phase the user is in based on their timezone.

### 1. Slow Activation — 5:00 to 7:00 AM

The body wakes up gradually. The mind is calm but not ready for intense work.

- **Best for:** meditation, journaling, breathing exercises, light reading
- **Avoid:** complex tasks, important decisions, analytical work

### 2. Morning Focus Peak — 7:00 to 9:00 AM

Body temperature rises, concentration increases. Good window for structuring the day.

- **Best for:** technical reading, structured study, day planning, reviewing notes
- **Avoid:** open-ended creative tasks, unstructured work

### 3. Cognitive Peak — 9:00 AM to 12:00 PM

Window of maximum mental performance. Highest processing speed and working memory.

- **Best for:** programming, logic, math, deep analysis, solving complex problems, learning new concepts
- **Avoid:** routine administrative tasks, purposeless meetings

### 4. Second Productivity Peak — 1:00 to 3:00 PM

After the post-lunch dip, energy recovers. Good window for execution-focused technical tasks.

- **Best for:** reviewing previous work, technical tasks with clear instructions, responding to important emails, follow-up meetings
- **Avoid:** learning completely new material

### 5. Creative Window — 3:00 to 5:00 PM

Cognitive inhibition drops slightly, favoring unconventional connections.

- **Best for:** writing, design, brainstorming, language learning, music, art
- **Avoid:** strict analytical work, tasks requiring high precision

### 6. Transition Phase — 5:00 to 7:00 PM

The body begins to slow down. Good window for consolidating what was learned.

- **Best for:** active review, consolidating notes, moderate physical exercise, learning conversations
- **Avoid:** starting new projects, high cognitive demand work

### 7. Introspective Phase — 7:00 to 9:00 PM

Low energy, reflective mind. Favors slow thinking and planning.

- **Best for:** slow reading, planning the next day, reflection, evening journaling
- **Avoid:** bright screens, intense work, important decisions

### 8. Sleep Preparation — 9:00 to 11:00 PM

The body produces melatonin. The goal is to ease the transition to sleep.

- **Best for:** relaxation routine, guided meditation, breathing, sleep hygiene
- **Avoid:** work, screens without blue light filter, caffeine, intense stimulation

---

## Phase Personalization

Each user can adjust the phases to their own cycle. Someone who sleeps at 10 PM and wakes at 5 AM has a different profile from someone who sleeps at 1 AM.

Personalization options per phase:

- **Enable or disable** the phase (if the user does not work during that time)
- **Change the start and end time**
- **Configure notifications** when entering each phase
- **Enable automatic task scheduling** based on the phase

---

## Work Types

Each task or activity in Ritmo belongs to a type that determines in which phases it is most effective:

| Type         | Description                    | Best phase                      |
| ------------ | ------------------------------ | ------------------------------- |
| **Work**     | Professional work tasks        | Cognitive peak, Second peak     |
| **Study**    | Learning new material          | Cognitive peak, Morning focus   |
| **Exercise** | Physical activity              | Transition, Second peak         |
| **Creative** | Design, writing, art           | Creative window                 |
| **Social**   | Meetings, collaboration        | Second peak, Transition         |
| **Personal** | Errands, personal organization | Second peak                     |
| **Health**   | Medical care, health routines  | Slow activation, Sleep prep     |
| **Learning** | Courses, languages, new skills | Cognitive peak, Creative window |

---

## How a Task Works

A task is the smallest unit of work in Ritmo. It has a complete lifecycle:

### Task States

```
To do → In progress → In review → Completed
                               → Cancelled
                               → Archived
```

- **To do (`todo`):** the task exists but has not been started yet
- **In progress (`in_progress`):** the user is actively working on it
- **In review (`review`):** the work is done but needs verification or correction
- **Completed (`completed`):** delivered and closed
- **Cancelled (`cancelled`):** intentionally discarded
- **Archived (`archived`):** saved as history without being active

### Task Attributes

- **Title and description** — what needs to be done and why
- **Priority** — how urgent and important it is
- **Estimated duration** — how long it is expected to take
- **Actual duration** — how long it actually took (recorded when closing)
- **Due date** — when it must be ready
- **Category** — the area it belongs to (e.g. work, study, personal)
- **Tags** — additional free-form classification

---

## Priority Levels

| Priority     | Meaning                                         |
| ------------ | ----------------------------------------------- |
| **Low**      | Can wait, no consequences if delayed            |
| **Medium**   | Important but not immediately urgent            |
| **High**     | Must be completed soon, consequences if delayed |
| **Urgent**   | Requires attention today                        |
| **Critical** | Serious impact if not resolved immediately      |

---

## Activities

An activity is a scheduled time block that contains one or more tasks. It works as a work container.

### Activity States

```
Planned → Active → Paused → Completed
                          → Cancelled
```

- **Planned:** on the calendar but not yet started
- **Active:** the user is executing it now
- **Paused:** interrupted, can be resumed
- **Completed:** closed with results

A paused activity has a cost: the user must recover mental context when resuming it.

---

## Work Sessions

When a user works on an activity, a work session is created. This is the unit of measurement for real behavior.

When closing a session the user records:

- **Focus score (1–10):** how concentrated was I?
- **Productivity score (1–10):** how much did I actually advance?
- **Optional notes:** observations about the session

This data feeds the user's personal profile and improves future recommendations.

---

## System Recommendations

Ritmo does not simply recommend "the most urgent task." It evaluates four factors:

1. **Phase fit** — does this type of work match the energy available right now?
2. **Importance and urgency** — priority, due date
3. **Feasibility** — is there enough energy and time available for this task now?
4. **Personal history** — how has this user performed on this type of task during this phase before?

The goal is to maximize **output quality**, not just the number of tasks completed.

---

## Tracking Metrics

### Streak

Consecutive days in which the user completed at least one work session. Measures consistency.

### Focus score

Average of how concentrated the user reports being. If it drops, it may indicate tasks are not well matched to the right phases.

### Productivity score

Average of perceived value generated per session. The gap between focus and productivity indicates whether the user gets distracted or underestimates their own work.

### Planning accuracy

Difference between estimated and actual duration. Helps calibrate future estimates.

### Phase performance index

Which phases produce better results for which types of work. Completely individual profile.

---

## Full Day Cycle in Ritmo

1. The user opens the app
2. The system detects the active circadian phase based on local time
3. Recommended tasks for that phase are displayed
4. The user starts an activity and works on their tasks
5. When the session ends, they record focus and productivity
6. At the end of the day, the journal or introspective phase invites reflection
7. The system updates the personal profile with the day's data
8. Next day's recommendations are more accurate

This cycle creates a continuous improvement system: the more the user uses the app, the more tailored the recommendations become.

---

## Categories

Users can create their own categories to organize work by area. Categories support hierarchy (a category can have subcategories).

Example uses:

- University → Math, Physics, Programming
- Work → Project A, Project B, Admin
- Personal → Health, Finance, Hobbies

---

## User Roles

| Role              | Access                                |
| ----------------- | ------------------------------------- |
| **User**          | Standard features                     |
| **Premium**       | Advanced features, extended analytics |
| **Moderator**     | Community management                  |
| **Administrator** | Full system control                   |
