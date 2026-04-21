-- ============================================================
-- 0006_contracts.sql  –  Contract & e-signature system
-- ============================================================

create table if not exists contract_templates (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  vendor_type    text check (vendor_type in ('photographer','videographer','both')),
  description    text,
  body_html      text not null,
  variables      jsonb not null default '[]',
  is_active      boolean default true,
  display_order  integer default 0,
  created_at     timestamptz default now()
);

create table if not exists contracts (
  id                    uuid primary key default gen_random_uuid(),
  vendor_id             uuid references vendors(id) on delete cascade,
  template_id           uuid references contract_templates(id),
  couple_name           text not null,
  couple_email          text not null,
  couple_phone          text,
  wedding_date          date,
  wedding_venue         text,
  package_name          text,
  package_price         decimal(10,2),
  retainer_amount       decimal(10,2),
  retainer_due_date     date,
  balance_due_date      date,
  coverage_hours        integer,
  deliverables          text,
  custom_notes          text,
  body_html             text not null,
  status                text default 'draft'
    check (status in ('draft','sent','viewed','signed','completed','cancelled')),
  sent_at               timestamptz,
  viewed_at             timestamptz,
  signed_at             timestamptz,
  signer_name           text,
  signer_ip             text,
  signer_user_agent     text,
  signer_user_id        uuid references profiles(id),
  pdf_url               text,
  booking_fee_charged   boolean default false,
  booking_fee_amount    decimal(10,2),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create table if not exists contract_audit_log (
  id           uuid primary key default gen_random_uuid(),
  contract_id  uuid references contracts(id) on delete cascade,
  action       text not null,
  actor_type   text check (actor_type in ('vendor','couple','system')),
  actor_id     uuid,
  actor_email  text,
  ip_address   text,
  user_agent   text,
  metadata     jsonb,
  created_at   timestamptz default now()
);

create index if not exists idx_contracts_vendor      on contracts(vendor_id);
create index if not exists idx_contracts_email       on contracts(couple_email);
create index if not exists idx_contracts_status      on contracts(status);
create index if not exists idx_contracts_date        on contracts(wedding_date);
create index if not exists idx_contract_audit_cid    on contract_audit_log(contract_id);

-- ── RLS ─────────────────────────────────────────────────────
alter table contract_templates  enable row level security;
alter table contracts           enable row level security;
alter table contract_audit_log  enable row level security;

-- Templates: anyone can read active templates
drop policy if exists "templates_public_read" on contract_templates;
create policy "templates_public_read" on contract_templates
  for select using (is_active = true);

-- Contracts: vendor owns their contracts
drop policy if exists "contracts_vendor_all" on contracts;
create policy "contracts_vendor_all" on contracts
  for all using (
    vendor_id = (select id from vendors where user_id = auth.uid() limit 1)
  );

-- Contracts: couple can read their own by email match OR by being the signer
drop policy if exists "contracts_couple_read" on contracts;
create policy "contracts_couple_read" on contracts
  for select using (
    couple_email = (select email from profiles where id = auth.uid() limit 1)
    or signer_user_id = auth.uid()
  );

-- Contracts: public read for signing page (any authenticated user can read a contract by id to sign)
drop policy if exists "contracts_sign_read" on contracts;
create policy "contracts_sign_read" on contracts
  for select using (
    status in ('sent','viewed','signed','completed')
  );

-- Contracts: couple can update to mark as signed
drop policy if exists "contracts_couple_sign" on contracts;
create policy "contracts_couple_sign" on contracts
  for update using (
    status in ('sent','viewed')
    and couple_email = (select email from profiles where id = auth.uid() limit 1)
  );

-- Audit log: vendor can read their contract audit
drop policy if exists "audit_vendor_read" on contract_audit_log;
create policy "audit_vendor_read" on contract_audit_log
  for select using (
    contract_id in (
      select id from contracts
      where vendor_id = (select id from vendors where user_id = auth.uid() limit 1)
    )
  );

-- Audit log: anyone authenticated can insert (for couple actions)
drop policy if exists "audit_insert" on contract_audit_log;
create policy "audit_insert" on contract_audit_log
  for insert with check (true);

-- ── Seed: Photography template ──────────────────────────────
insert into contract_templates (name, vendor_type, description, display_order, variables, body_html)
values (
  'Wedding Photography Contract',
  'photographer',
  'Professional photography agreement covering services, payment, cancellation, copyright, and delivery timeline.',
  1,
  '["photographer_name","business_name","couple_name","wedding_date","wedding_venue","package_name","package_price","retainer_amount","retainer_due_date","balance_due_date","balance_amount","coverage_hours","deliverables","custom_notes","contract_date","vendor_email","vendor_phone"]'::jsonb,
  '<div class="contract-body"><h1>Wedding Photography Agreement</h1><p>This agreement is entered into on {{contract_date}} between <strong>{{business_name}}</strong> ("Photographer"), operated by {{photographer_name}}, and <strong>{{couple_name}}</strong> ("Client").</p><h2>1. Services</h2><p>Photographer agrees to provide wedding photography services for the event described below:</p><ul><li><strong>Wedding Date:</strong> {{wedding_date}}</li><li><strong>Venue:</strong> {{wedding_venue}}</li><li><strong>Package:</strong> {{package_name}}</li><li><strong>Coverage Hours:</strong> {{coverage_hours}} hours</li><li><strong>Deliverables:</strong> {{deliverables}}</li></ul><h2>2. Payment</h2><p><strong>Total Package Investment:</strong> ${{package_price}}</p><p>A non-refundable retainer of <strong>${{retainer_amount}}</strong> is due by {{retainer_due_date}} to secure this date. The retainer is applied toward the total package investment.</p><p>The remaining balance of <strong>${{balance_amount}}</strong> is due by {{balance_due_date}}.</p><p>Payment methods accepted: bank transfer, credit card, Venmo, Zelle, or cash.</p><h2>3. Cancellation and Rescheduling</h2><p>If the Client cancels this agreement, the retainer is non-refundable in all circumstances as it compensates the Photographer for reserving the date and turning away other bookings.</p><p>If cancellation occurs within 60 days of the wedding date, the full package investment is due. If cancellation occurs more than 60 days prior, only the retainer is forfeited.</p><p>One date change is permitted at no charge if requested more than 90 days in advance and the new date is available. Date changes within 90 days of the original date are treated as cancellations.</p><h2>4. Delivery Timeline</h2><p>The Photographer will deliver the edited gallery within <strong>8 weeks</strong> of the wedding date. A sneak preview of 10–20 images will be delivered within 2 weeks. Galleries are delivered via VowVendors gallery link.</p><h2>5. Copyright and Usage</h2><p>The Photographer retains copyright of all images. The Client is granted a personal-use license to print, share on social media, and use images for non-commercial purposes. Images may not be sold, used in advertising, or altered without written permission.</p><p>The Photographer reserves the right to use images for portfolio, website, social media, and marketing purposes unless the Client requests otherwise in writing before the wedding date.</p><h2>6. Liability</h2><p>In the unlikely event that the Photographer is unable to perform due to illness, injury, or emergency, the Photographer will make every reasonable effort to find a qualified replacement of equal skill. If no replacement can be found, the Client will receive a full refund of all payments made.</p><p>The Photographer is not liable for failure to deliver images due to equipment malfunction, file corruption, or circumstances beyond reasonable control. Total liability shall not exceed the total amount paid by the Client.</p><h2>7. Conduct and Access</h2><p>The Client agrees to provide the Photographer with reasonable access to all areas of the event. The Photographer requires a vendor meal at events longer than 5 hours.</p><h2>8. Additional Terms</h2><p>{{custom_notes}}</p><h2>9. Agreement</h2><p>By signing below, both parties agree to the terms of this contract. This agreement constitutes the entire agreement between the parties and supersedes all prior discussions.</p></div>'
) on conflict do nothing;

-- ── Seed: Videography template ──────────────────────────────
insert into contract_templates (name, vendor_type, description, display_order, variables, body_html)
values (
  'Wedding Videography Contract',
  'videographer',
  'Professional videography agreement with video-specific delivery, music licensing, and raw footage policies.',
  2,
  '["videographer_name","business_name","couple_name","wedding_date","wedding_venue","package_name","package_price","retainer_amount","retainer_due_date","balance_due_date","balance_amount","coverage_hours","deliverables","video_format","music_license","raw_footage_policy","custom_notes","contract_date","vendor_email","vendor_phone"]'::jsonb,
  '<div class="contract-body"><h1>Wedding Videography Agreement</h1><p>This agreement is entered into on {{contract_date}} between <strong>{{business_name}}</strong> ("Videographer"), operated by {{videographer_name}}, and <strong>{{couple_name}}</strong> ("Client").</p><h2>1. Services</h2><ul><li><strong>Wedding Date:</strong> {{wedding_date}}</li><li><strong>Venue:</strong> {{wedding_venue}}</li><li><strong>Package:</strong> {{package_name}}</li><li><strong>Coverage Hours:</strong> {{coverage_hours}} hours</li><li><strong>Deliverables:</strong> {{deliverables}}</li><li><strong>Video Format:</strong> {{video_format}}</li></ul><h2>2. Payment</h2><p><strong>Total Investment:</strong> ${{package_price}}</p><p>Non-refundable retainer of <strong>${{retainer_amount}}</strong> due by {{retainer_due_date}}.</p><p>Balance of <strong>${{balance_amount}}</strong> due by {{balance_due_date}}.</p><h2>3. Delivery Timeline</h2><p>Highlight film (3–5 minutes): delivered within <strong>10 weeks</strong> of the wedding date.</p><p>Full ceremony and reception edit (if included): delivered within <strong>16 weeks</strong>.</p><p>One round of minor revisions is included. Major re-edits are billed at $150/hour.</p><h2>4. Music Licensing</h2><p>{{music_license}}</p><p>The Videographer will use properly licensed music. Unlicensed music cannot be used in films intended for social media distribution.</p><h2>5. Raw Footage</h2><p>{{raw_footage_policy}}</p><h2>6. Copyright and Usage</h2><p>The Videographer retains copyright of all footage and edited films. The Client receives a personal-use license. The Videographer may use the film for portfolio and marketing purposes.</p><h2>7. Cancellation</h2><p>Retainer non-refundable. Full balance due if cancelled within 60 days. One date change permitted if requested 90+ days in advance.</p><h2>8. Liability</h2><p>Videographer not liable for audio quality issues beyond their control. Total liability does not exceed total amount paid.</p><h2>9. Additional Terms</h2><p>{{custom_notes}}</p><h2>10. Agreement</h2><p>By signing, both parties agree to the terms stated above.</p></div>'
) on conflict do nothing;
