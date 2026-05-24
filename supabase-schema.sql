-- ==========================================
-- Supabase Schema DDL: Feedback & Notifications tables
-- Target Database: Supabase PostgreSQL
-- ==========================================

-- 1. FEEDBACK TABLE definition
-- Centered around qualitative teacher, principal, and vendor program evaluations.
create table if not exists public.feedback (
    id text not null, -- e.g., 'FB-001' or standard text primary key
    program_id text not null, -- references programs(id)
    activity_id text, -- nullable if feedback is overall program-level, references activities(id)
    source text not null, -- 'Teacher', 'Principal', 'Vendor'
    sentiment_score integer not null constraint chk_sentiment check (sentiment_score between 1 and 5),
    comment text,
    submitted_date date not null default current_date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,

    constraint feedback_pkey primary key (id)
);

-- Safeguard: if public.feedback table already existed in Supabase, add activity_id column
alter table public.feedback add column if not exists activity_id text;

-- Foreign key constraints for Feedback (making sure deletion cascades cleanly)
alter table public.feedback drop constraint if exists fk_feedback_program;
alter table public.feedback 
    add constraint fk_feedback_program 
    foreign key (program_id) 
    references public.programs(id) 
    on delete cascade;

alter table public.feedback drop constraint if exists fk_feedback_activity;
alter table public.feedback 
    add constraint fk_feedback_activity 
    foreign key (activity_id) 
    references public.activities(id) 
    on delete set null;


-- 2. NOTIFICATIONS TABLE definition
-- Unlinked alert engine module for school operators and coordinator actions.
create table if not exists public.notifications (
    id uuid default gen_random_uuid() not null,
    user_id uuid, -- links to auth.users if assigned to a specific account, or nullable for all coordinators
    title text not null,
    message text not null,
    type text not null default 'info', -- 'info', 'warning', 'success', 'error'
    read boolean not null default false,
    related_program_id text, -- references programs(id) if applicable
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,

    constraint notifications_pkey primary key (id)
);

alter table public.notifications drop constraint if exists fk_notifications_program;
alter table public.notifications 
    add constraint fk_notifications_program 
    foreign key (related_program_id) 
    references public.programs(id) 
    on delete cascade;


-- 3. INDEXES for query speed inside dashboards
create index if not exists idx_feedback_program_id on public.feedback(program_id);
create index if not exists idx_feedback_activity_id on public.feedback(activity_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_read on public.notifications(read) where read = false;


-- 4. ROW LEVEL SECURITY (RLS) policies 
-- Enable row-level protection
alter table public.feedback enable row level security;
alter table public.notifications enable row level security;

-- Policies for Feedback table
create policy "Allow all authenticated users to read feedbacks"
    on public.feedback for select
    to authenticated
    using (true);

create policy "Allow authenticated users to submit feedback"
    on public.feedback for insert
    to authenticated
    with check (true);

create policy "Allow individuals to update their own feedback comments"
    on public.feedback for update
    to authenticated
    using (true);

-- Policies for Notifications table
create policy "Users can read their own assigned notifications"
    on public.notifications for select
    to authenticated
    using (user_id = auth.uid() or user_id is null);

create policy "System can create notifications for users"
    on public.notifications for insert
    to authenticated
    with check (true);

create policy "Users can mark alert notifications as read"
    on public.notifications for update
    to authenticated
    using (user_id = auth.uid() or user_id is null)
    with check (read is not null);
