# LevelUP — Gamificação de Produtividade Pessoal

**Autor:** Gonçalo Filipe Ferreira Sousa  
**Número de Aluno:** 14483  
**Curso:** Técnico/a de Gestão e Programação de Sistemas Informáticos  
**Ano Letivo:** 2025/2026  

---

## Descrição

O **LevelUP** é uma aplicação web progressiva (PWA) de gamificação de produtividade pessoal. O utilizador cria uma personagem RPG e ganha experiência (XP) ao completar missões do dia-a-dia — exercício físico, estudo, bem-estar, entre outras. O sistema inclui progressão de níveis, atributos por classe, equipamentos com bónus de estatísticas, sequências diárias (*streaks*) com bónus de XP, e um ranking semanal entre utilizadores com reset automático às segundas-feiras.

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Função |
|---|---|---|
| React | 19 | Framework de frontend |
| Vite | 8 | Bundler e servidor de desenvolvimento |
| React Router | 7 | Navegação com lazy loading |
| Supabase | — | Autenticação, base de dados PostgreSQL e RLS |
| Zustand | 5 | Gestão de estado global |
| CSS Modules | — | Estilos com escopo por componente |
| vite-plugin-pwa | — | PWA instalável com suporte offline |
| react-hot-toast | 2 | Notificações |
| lucide-react | — | Ícones |

---

## Requisitos

- **Node.js** 18 ou superior
- **npm** (incluído com o Node.js)
- **Conta no Supabase** (gratuita) — [supabase.com](https://supabase.com)

---

## Instalação e Execução

### 1. Clonar o repositório

```bash
git clone https://github.com/a14483-oficina/a14483-oficina-levelup-pap.git
cd a14483-oficina-levelup-pap/levelup
```

### 2. Instalar as dependências

```bash
npm install --legacy-peer-deps
```

### 3. Configurar as variáveis de ambiente

Copia o ficheiro de exemplo e preenche com as tuas credenciais do Supabase:

```bash
cp .env.example .env
```

Edita o ficheiro `.env` com as credenciais do teu projeto Supabase:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA
```

> **Como obter as credenciais:**  
> No painel do Supabase → o teu projeto → **Settings** → **API**.  
> Copia o **Project URL** e a chave **anon / public**.  
> ⚠️ Nunca uses a chave `service_role` no frontend.

### 4. Configurar a base de dados

No Supabase, abre o **SQL Editor** e executa o script abaixo para criar todas as tabelas:

```sql
-- Tabela de utilizadores (complementa a tabela auth.users do Supabase)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR,
  email VARCHAR,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Personagens RPG
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  class_type VARCHAR NOT NULL,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  xp_to_next_level INT DEFAULT 100,
  strength INT DEFAULT 1,
  agility INT DEFAULT 1,
  intelligence INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT now()
);

-- Catálogo de itens
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR,
  rarity VARCHAR,
  stat_bonus JSONB,
  image_url TEXT
);

-- Inventário do personagem
CREATE TABLE character_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  equipped BOOLEAN DEFAULT false,
  obtained_at TIMESTAMP DEFAULT now()
);

-- Catálogo de missões
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR CHECK (type IN ('daily', 'weekly', 'extra', 'boss')),
  category VARCHAR CHECK (category IN ('exercise', 'study', 'wellness', 'social', 'mental')),
  xp_reward INT DEFAULT 0,
  item_reward_id UUID REFERENCES items(id),
  difficulty INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);

-- Missões atribuídas ao utilizador
CREATE TABLE user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id),
  status VARCHAR CHECK (status IN ('assigned', 'in_progress', 'completed', 'expired')),
  assigned_date DATE,
  completed_at TIMESTAMP,
  xp_earned INT DEFAULT 0
);

-- Sequências diárias (streaks)
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  streak_bonus_xp INT DEFAULT 0
);

-- Ranking semanal
CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE,
  week_end DATE,
  weekly_xp INT DEFAULT 0,
  position INT,
  missions_completed INT DEFAULT 0,
  UNIQUE(user_id, week_start)
);
```

Activa o **Row Level Security (RLS)** para cada tabela e cria as políticas adequadas. Exemplo para `characters`:

```sql
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizador vê o seu personagem"
  ON characters FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Utilizador cria o seu personagem"
  ON characters FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Utilizador actualiza o seu personagem"
  ON characters FOR UPDATE
  USING (user_id = auth.uid());
```

> Repete o mesmo padrão para as restantes tabelas.

### 5. Trigger de criação de utilizador (recomendado)

Para que a tabela `users` seja preenchida automaticamente após o registo, cria este trigger no Supabase:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));

  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 6. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Abre o browser em: **http://localhost:5173**

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento Vite |
| `npm run build` | Gera a build de produção (pasta `dist/`) |
| `npm run preview` | Serve a build de produção localmente |
| `npm run lint` | Analisa o código com ESLint |

---

## Estrutura do Projeto

```
levelup/
├── public/                        # Ficheiros estáticos
│   ├── icons/                     # Ícones PWA (192×192, 512×512)
│   ├── favicon.svg
│   ├── logo.png
│   └── offline.html               # Página offline (PWA)
└── src/
    ├── components/
    │   ├── layout/                # AppLayout, BottomNav, Header, ProtectedRoute
    │   └── ui/                    # Componentes reutilizáveis (Button, Card, Modal, …)
    ├── contexts/                  # AuthContext
    ├── hooks/                     # useAuth, useCharacter, useMissions, useStreak
    ├── pages/
    │   ├── Auth/                  # Login e Registo
    │   ├── Character/             # Personagem e criação
    │   ├── Home/                  # Dashboard principal
    │   ├── Missions/              # Sistema de missões
    │   ├── Rankings/              # Ranking semanal
    │   └── Profile/               # Perfil do utilizador
    ├── services/                  # Acesso à base de dados (Supabase)
    ├── stores/                    # Stores Zustand (auth, character, mission, streak)
    ├── styles/                    # variables.css, global.css, animations.css
    └── utils/                     # Constantes, helpers e validadores
```

---

## Funcionalidades

- Registo e autenticação de utilizadores (Supabase Auth)
- Criação de personagem com escolha de classe (Guerreiro, Mago, Ladino, Paladino)
- Missões diárias atribuídas automaticamente (4/dia) e missões semanais (aceitação manual)
- Ganho de XP com suporte a múltiplos level-ups por missão
- Bónus de XP por sequência (*streak*) diária — até +50 XP por missão
- Inventário e equipamento de itens com bónus de atributos
- Ranking semanal com reset automático às segundas-feiras
- Interface responsiva e instalável como PWA (funciona offline)
- Toda a interface em português (pt-PT)

---

## Build para Produção

```bash
npm run build
```

Os ficheiros de produção ficam na pasta `dist/`. Podes fazer deploy em qualquer serviço de hosting estático, como **Vercel**, **Netlify** ou **GitHub Pages**.

Exemplo com Vercel:

```bash
npm install -g vercel
vercel --prod
```

---

## Licença

Projeto académico — PAP 2025/2026  
Escola Profissional  
Aluno n.º 14483
