# ClientHub

Plataforma de gestión de solicitudes para profesionales de marketing.

## Setup inicial

### 1. Instalar dependencias

```bash
cd clienthub
npm install
```

### 2. Configurar Supabase

1. Andá a [supabase.com](https://supabase.com) y abrí tu proyecto
2. Ve a **Project Settings** > **API**
3. Copiá los valores:
   - `Project URL` → Este es tu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → Este es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Creá el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Crear las tablas en Supabase

1. En Supabase, andá a **SQL Editor**
2. Hacé click en **New query**
3. Copiá y pegá todo el contenido del archivo `supabase/schema.sql`
4. Hacé click en **Run**

### 4. Correr el proyecto

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del proyecto

```
clienthub/
├── src/
│   ├── app/                    # Pages y layouts (Next.js App Router)
│   │   ├── dashboard/          # Dashboard del proveedor
│   │   │   ├── layout.tsx      # Layout con sidebar
│   │   │   └── page.tsx        # Página principal
│   │   ├── login/              # Página de login
│   │   ├── globals.css         # Estilos globales
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home (redirect)
│   ├── components/             # Componentes reutilizables
│   │   └── dashboard/
│   │       ├── Sidebar.tsx
│   │       ├── StatsCards.tsx
│   │       └── RequestsList.tsx
│   ├── lib/                    # Utilidades
│   │   ├── supabase/           # Clientes de Supabase
│   │   │   ├── client.ts       # Para componentes cliente
│   │   │   ├── server.ts       # Para componentes servidor
│   │   │   └── middleware.ts   # Para middleware
│   │   └── utils.ts            # Helpers
│   ├── types/                  # TypeScript types
│   │   └── database.ts         # Tipos de la DB
│   └── middleware.ts           # Next.js middleware
├── supabase/
│   └── schema.sql              # Script para crear tablas
├── .env.local.example          # Template de variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Próximos pasos

- [ ] Crear organización al registrarse
- [ ] CRUD de clientes
- [ ] Crear solicitudes
- [ ] Sistema de comentarios
- [ ] Notificaciones por email
- [ ] Portal del cliente

## Stack tecnológico

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Supabase** - Base de datos, auth, storage
- **Lucide React** - Íconos

## Despliegue

### Desplegar en Vercel

1. Subí el proyecto a GitHub:

```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/clienthub.git
git push -u origin main
```

2. Andá a [vercel.com](https://vercel.com) y hacé login
3. Click en "Add New Project"
4. Importá tu repositorio de GitHub
5. Configurá las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (la URL de producción que te da Vercel)
6. Click en "Deploy"

### Variables de entorno en Vercel

En la configuración del proyecto en Vercel, agregá estas variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
```

### Configurar Supabase para producción

1. En Supabase, andá a **Authentication** > **URL Configuration**
2. Agregá tu URL de Vercel a **Site URL** y **Redirect URLs**
3. Ejemplo: `https://tu-proyecto.vercel.app`
