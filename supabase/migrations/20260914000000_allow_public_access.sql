-- Enable anonymous and public users to access LexClear without sign-in barriers
alter table public.documents alter column user_id drop not null;
alter table public.documents drop constraint if exists documents_user_id_fkey;
alter table public.chat_messages drop constraint if exists chat_messages_user_id_fkey;
alter table public.chat_messages alter column user_id drop not null;

-- Recreate RLS policies so public visitors can upload, index, and query without mandatory login
drop policy if exists "Users manage own documents" on public.documents;
drop policy if exists "Users access own chunks" on public.document_chunks;
drop policy if exists "Users access own analysis" on public.document_analysis;
drop policy if exists "Users manage own chats" on public.chat_messages;

-- Open policies for instant frictionless evaluation
create policy "Allow all document operations" on public.documents for all using (true) with check (true);
create policy "Allow all chunk operations" on public.document_chunks for all using (true) with check (true);
create policy "Allow all analysis operations" on public.document_analysis for all using (true) with check (true);
create policy "Allow all chat operations" on public.chat_messages for all using (true) with check (true);
