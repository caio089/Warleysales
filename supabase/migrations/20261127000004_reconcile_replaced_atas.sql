-- Corrige trocas registradas antes do cancelamento automático.
-- Somente atas antigas identificadas pela auditoria da troca podem ser canceladas.
with replacements as (
  select a.id as replacement_id, a.process_id, a.council_id, a.created_at,
         case when jsonb_typeof(l.details -> 'priorAtaIds') = 'array'
              then l.details -> 'priorAtaIds' else '[]'::jsonb end as prior_ata_ids
  from public.audit_logs l
  join public.price_registration_atas a
    on l.entity_id = a.id::text and l.council_id = a.council_id
  where l.action = 'ata.create'
    and l.entity = 'price_registration_ata'
    and l.result = 'success'
    and a.process_id is not null
    and nullif(btrim(l.details ->> 'replacementJustification'), '') is not null
)
update public.price_registration_atas prior
set status = 'cancelada'
from replacements replacement
where prior.council_id = replacement.council_id
  and prior.process_id = replacement.process_id
  and prior.id <> replacement.replacement_id
  and prior.created_at <= replacement.created_at
  and prior.status <> 'cancelada'
  and replacement.prior_ata_ids ? prior.id::text;
