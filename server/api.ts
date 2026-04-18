import type { IncomingMessage, ServerResponse } from 'node:http';
import { getPrisma } from './prisma';
import type { Plugin } from 'vite';

type JsonValue = Record<string, unknown>;

type WorkoutPayload = {
  name: string;
  schedule: {
    time: string;
    weekDays: string[];
  };
  exercises: Array<{
    group: string;
    subcategory: string;
    name: string;
    sets: string;
    repsOrTime: string;
    rest: string;
  }>;
};

function sendJson(response: ServerResponse, statusCode: number, body: JsonValue) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

async function readBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) {
    return {} as JsonValue;
  }

  return JSON.parse(raw) as JsonValue;
}

function isWorkoutPayload(value: unknown): value is WorkoutPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as WorkoutPayload;
  return (
    typeof payload.name === 'string' &&
    typeof payload.schedule?.time === 'string' &&
    Array.isArray(payload.schedule?.weekDays) &&
    Array.isArray(payload.exercises)
  );
}

async function ensureProfile(clientId: string) {
  const prisma = getPrisma();

  return prisma.userProfile.upsert({
    where: { clientId },
    create: { clientId },
    update: {}
  });
}

function mapWorkout(workout: {
  id: string;
  name: string;
  trainingTime: string;
  weekDays: string[];
  createdAt: Date;
  updatedAt: Date;
  exercises: Array<{
    id: string;
    group: string;
    subcategory: string;
    name: string;
    sets: string;
    repsOrTime: string;
    rest: string;
  }>;
}) {
  return {
    id: workout.id,
    name: workout.name,
    schedule: {
      time: workout.trainingTime,
      weekDays: workout.weekDays
    },
    exercises: workout.exercises.map((exercise) => ({
      id: exercise.id,
      group: exercise.group,
      subcategory: exercise.subcategory,
      name: exercise.name,
      sets: exercise.sets,
      repsOrTime: exercise.repsOrTime,
      rest: exercise.rest
    })),
    createdAt: workout.createdAt.toISOString(),
    updatedAt: workout.updatedAt.toISOString()
  };
}

function getClientIdFromRequest(url: URL) {
  const clientId = url.searchParams.get('clientId');
  return typeof clientId === 'string' && clientId.trim() ? clientId.trim() : '';
}

export async function handleApiRequest(request: IncomingMessage, response: ServerResponse) {
  const method = request.method ?? 'GET';
  const url = new URL(request.url ?? '/', 'http://localhost');
  const pathname = url.pathname;

  if (pathname === '/api/profile' && method === 'GET') {
    const clientId = getClientIdFromRequest(url);

    if (!clientId) {
      sendJson(response, 400, { error: 'clientId e obrigatorio.' });
      return;
    }

    const profile = await ensureProfile(clientId);
    sendJson(response, 200, {
      profile: {
        onboardingSeen: profile.onboardingSeen,
        experienceLevel: profile.experienceLevel,
        workoutMode: profile.workoutMode,
        recommendationGoal: profile.recommendationGoal,
        recommendationLevel: profile.recommendationLevel
      }
    });
    return;
  }

  if (pathname === '/api/profile' && method === 'POST') {
    const prisma = getPrisma();
    const body = await readBody(request);
    const clientId = typeof body.clientId === 'string' ? body.clientId.trim() : '';

    if (!clientId) {
      sendJson(response, 400, { error: 'clientId e obrigatorio.' });
      return;
    }

    const profile = await prisma.userProfile.upsert({
      where: { clientId },
      create: {
        clientId,
        onboardingSeen: Boolean(body.onboardingSeen),
        experienceLevel: typeof body.experienceLevel === 'string' ? body.experienceLevel : null,
        workoutMode: typeof body.workoutMode === 'string' ? body.workoutMode : null,
        recommendationGoal: typeof body.recommendationGoal === 'string' ? body.recommendationGoal : null,
        recommendationLevel: typeof body.recommendationLevel === 'string' ? body.recommendationLevel : null
      },
      update: {
        onboardingSeen: Boolean(body.onboardingSeen),
        experienceLevel: typeof body.experienceLevel === 'string' ? body.experienceLevel : null,
        workoutMode: typeof body.workoutMode === 'string' ? body.workoutMode : null,
        recommendationGoal: typeof body.recommendationGoal === 'string' ? body.recommendationGoal : null,
        recommendationLevel: typeof body.recommendationLevel === 'string' ? body.recommendationLevel : null
      }
    });

    sendJson(response, 200, {
      profile: {
        onboardingSeen: profile.onboardingSeen,
        experienceLevel: profile.experienceLevel,
        workoutMode: profile.workoutMode,
        recommendationGoal: profile.recommendationGoal,
        recommendationLevel: profile.recommendationLevel
      }
    });
    return;
  }

  if (pathname === '/api/workouts' && method === 'GET') {
    const prisma = getPrisma();
    const clientId = getClientIdFromRequest(url);

    if (!clientId) {
      sendJson(response, 400, { error: 'clientId e obrigatorio.' });
      return;
    }

    const profile = await ensureProfile(clientId);
    const workouts = await prisma.workout.findMany({
      where: { userId: profile.id },
      include: {
        exercises: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    sendJson(response, 200, { workouts: workouts.map(mapWorkout) });
    return;
  }

  if (pathname === '/api/workouts' && method === 'POST') {
    const prisma = getPrisma();
    const body = await readBody(request);
    const clientId = typeof body.clientId === 'string' ? body.clientId.trim() : '';
    const payload = body.payload;

    if (!clientId || !isWorkoutPayload(payload)) {
      sendJson(response, 400, { error: 'Dados invalidos para criar treino.' });
      return;
    }

    const profile = await ensureProfile(clientId);

    const created = await prisma.workout.create({
      data: {
        userId: profile.id,
        name: payload.name,
        trainingTime: payload.schedule.time,
        weekDays: payload.schedule.weekDays,
        exercises: {
          create: payload.exercises.map((exercise, index) => ({
            order: index,
            group: exercise.group,
            subcategory: exercise.subcategory,
            name: exercise.name,
            sets: exercise.sets,
            repsOrTime: exercise.repsOrTime,
            rest: exercise.rest
          }))
        }
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' }
        }
      }
    });

    sendJson(response, 201, { workout: mapWorkout(created) });
    return;
  }

  if (pathname.startsWith('/api/workouts/') && method === 'PUT') {
    const prisma = getPrisma();
    const body = await readBody(request);
    const clientId = typeof body.clientId === 'string' ? body.clientId.trim() : '';
    const payload = body.payload;
    const workoutId = pathname.replace('/api/workouts/', '');

    if (!clientId || !workoutId || !isWorkoutPayload(payload)) {
      sendJson(response, 400, { error: 'Dados invalidos para atualizar treino.' });
      return;
    }

    const profile = await ensureProfile(clientId);
    const existing = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: profile.id
      }
    });

    if (!existing) {
      sendJson(response, 404, { error: 'Treino nao encontrado.' });
      return;
    }

    const updated = await prisma.workout.update({
      where: { id: workoutId },
      data: {
        name: payload.name,
        trainingTime: payload.schedule.time,
        weekDays: payload.schedule.weekDays,
        exercises: {
          deleteMany: {},
          create: payload.exercises.map((exercise, index) => ({
            order: index,
            group: exercise.group,
            subcategory: exercise.subcategory,
            name: exercise.name,
            sets: exercise.sets,
            repsOrTime: exercise.repsOrTime,
            rest: exercise.rest
          }))
        }
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' }
        }
      }
    });

    sendJson(response, 200, { workout: mapWorkout(updated) });
    return;
  }

  if (pathname.startsWith('/api/workouts/') && method === 'DELETE') {
    const prisma = getPrisma();
    const clientId = getClientIdFromRequest(url);
    const workoutId = pathname.replace('/api/workouts/', '');

    if (!clientId || !workoutId) {
      sendJson(response, 400, { error: 'clientId e id do treino sao obrigatorios.' });
      return;
    }

    const profile = await ensureProfile(clientId);
    const existing = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: profile.id
      }
    });

    if (!existing) {
      sendJson(response, 404, { error: 'Treino nao encontrado.' });
      return;
    }

    await prisma.workout.delete({
      where: { id: workoutId }
    });

    sendJson(response, 200, { success: true });
    return;
  }

  sendJson(response, 404, { error: 'Rota nao encontrada.' });
}

function createMiddleware() {
  return async (request: IncomingMessage, response: ServerResponse, next: () => void) => {
    if (!request.url?.startsWith('/api/')) {
      next();
      return;
    }

    try {
      await handleApiRequest(request, response);
    } catch (error) {
      console.error('Erro ao processar API local:', error);

      const details =
        process.env.NODE_ENV !== 'production' && error instanceof Error
          ? error.message
          : undefined;

      sendJson(response, 500, {
        error: 'Erro interno ao processar requisicao.',
        ...(details ? { details } : {})
      });
    }
  };
}

export function gymmetricApiPlugin(): Plugin {
  return {
    name: 'gymmetric-api',
    configureServer(server) {
      server.middlewares.use(createMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createMiddleware());
    }
  };
}
