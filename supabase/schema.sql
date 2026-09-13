-- LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
-- Author: Sabarish R <sabarishr1087@gmail.com>
-- Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
-- Original work by the author. Please do not resubmit it as your own — see LICENSE.

create extension if not exists vector;

create table public.documents (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, raw_text text not null, status text not null default 'processing' check (status in ('processing','ready','failed')), created_at timestamptz not null default now()
);
create table public.document_chunks (
  id uuid primary key default gen_random_uuid(), document_id uuid not null references public.documents(id) on delete cascade,
  content text not null, chunk_index integer not null, embedding vector(768) not null
);
create table public.document_analysis (
  id uuid primary key default gen_random_uuid(), document_id uuid not null references public.documents(id) on delete cascade,
  clause_text text not null, plain_text text not null, category text not null, risk_level text not null check (risk_level in ('favorable','neutral','risky','needs-attention')), reason text not null, clause_ref text not null, created_at timestamptz not null default now()
);
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(), document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, role text not null check (role in ('user','assistant')), content text not null, created_at timestamptz not null default now()
);
alter table public.documents enable row level security; alter table public.document_chunks enable row level security; alter table public.document_analysis enable row level security; alter table public.chat_messages enable row level security;
create policy "Users manage own documents" on public.documents for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users access own chunks" on public.document_chunks for all using (exists(select 1 from public.documents d where d.id=document_id and d.user_id=auth.uid()));
create policy "Users access own analysis" on public.document_analysis for all using (exists(select 1 from public.documents d where d.id=document_id and d.user_id=auth.uid()));
create policy "Users manage own chats" on public.chat_messages for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create or replace function public.match_document_chunks(query_embedding vector(768), match_document_id uuid, match_count int)
returns table(content text, chunk_index integer, similarity float) language sql stable as $$ select content, chunk_index, 1 - (embedding <=> query_embedding) from public.document_chunks where document_id = match_document_id order by embedding <=> query_embedding limit match_count; $$;
