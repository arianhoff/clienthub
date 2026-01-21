# Guía de Deployment

## Estado actual del proyecto

El proyecto ClientHub está configurado y listo para deployment en Vercel.

### Repositorio GitHub

- **URL**: https://github.com/arianhoff/clienthub
- **Rama principal**: `master`
- **Último commit**: Correcciones de tipos de TypeScript para Supabase

### Correcciones realizadas

1. **Tipos de TypeScript**:
   - Agregado `subscription_status` y `trial_ends_at` al tipo `Organization`
   - Creado archivo `src/lib/supabase/types-helper.ts` con tipos reutilizables
   - Solucionados errores de inferencia de tipos en queries de Supabase

2. **Configuración de Git**:
   - Archivo `.gitignore` completo para Next.js
   - Excluye `node_modules`, `.next`, `.env.local`, etc.
   - Archivo `.env.example` con variables de entorno requeridas

### Variables de entorno necesarias

Para deployar en Vercel, necesitás configurar estas variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

## Pasos para deployar en Vercel

1. **Ir a Vercel**: https://vercel.com

2. **Importar proyecto**:
   - Click en "Add New Project"
   - Seleccionar "Import Git Repository"
   - Buscar `arianhoff/clienthub`
   - Click en "Import"

3. **Configurar variables de entorno**:
   - En la sección "Environment Variables"
   - Agregar `NEXT_PUBLIC_SUPABASE_URL`
   - Agregar `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**:
   - Vercel detectará automáticamente Next.js
   - Click en "Deploy"
   - Esperar a que termine el build

## Configuración de Supabase

### Ejecutar migraciones

1. Ir a tu proyecto en Supabase
2. SQL Editor
3. Ejecutar el archivo `supabase/schema.sql` (crear tablas)
4. Ejecutar el archivo `supabase/migration-trial.sql` (agregar campos de trial)

### Configurar Authentication

En Supabase > Authentication > URL Configuration:
- Agregar la URL de Vercel a "Site URL"
- Agregar la URL de Vercel a "Redirect URLs"

Ejemplo:
```
Site URL: https://tu-app.vercel.app
Redirect URLs: https://tu-app.vercel.app/**
```

## Problemas conocidos y soluciones

### Error de tipos "Property 'X' does not exist on type 'never'"

**Causa**: TypeScript no puede inferir tipos de queries de Supabase con `.select()`.

**Solución**: Usar los tipos de `src/lib/supabase/types-helper.ts`:

```typescript
import type { ProfileSelect, OrganizationSelect } from '@/lib/supabase/types-helper'

const { data } = await supabase
  .from('profiles')
  .select('organization_id, role')
  .single()

const profile = data as ProfileSelect
```

### Archivos con "as any"

Hay aproximadamente 31 archivos que todavía usan `as any`. Estos funcionarán pero no tienen type safety. Se pueden ir migrando gradualmente usando los tipos de `types-helper.ts`.

## Próximos pasos

1. Deploy a Vercel
2. Configurar variables de entorno
3. Ejecutar migraciones en Supabase
4. Configurar URLs de autenticación
5. Probar el flujo de registro y login

## Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Vercel](https://vercel.com/docs)
