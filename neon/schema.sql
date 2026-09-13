-- Neon Schema for LexClear
create extension if not exists vector;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default gen_random_uuid(),
  title text not null,
  raw_text text not null,
  status text not null default 'processing' check (status in ('processing','ready','failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  content text not null,
  chunk_index integer not null,
  embedding vector(768) not null
);

create table if not exists public.document_analysis (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  clause_text text not null,
  plain_text text not null,
  category text not null,
  risk_level text not null check (risk_level in ('favorable','neutral','risky','needs-attention')),
  reason text not null,
  clause_ref text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null default gen_random_uuid(),
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create or replace function public.match_document_chunks(query_embedding vector(768), match_document_id uuid, match_count int)
returns table(content text, chunk_index integer, similarity float) language sql stable as $$
  select content, chunk_index, 1 - (embedding <=> query_embedding)
  from public.document_chunks
  where document_id = match_document_id
  order by embedding <=> query_embedding
  limit match_count;
$$;
