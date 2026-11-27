begin;

do $$
declare
  role_name text;
  table_name text;
  privilege_name text;
begin
  foreach role_name in array array['anon', 'authenticated', 'service_role'] loop
    if has_function_privilege(role_name, 'public.save_transfer(jsonb)', 'EXECUTE')
       or has_function_privilege(role_name,
         'public.advance_transfer(uuid,text,uuid,timestamptz,text,jsonb)', 'EXECUTE') then
      raise exception 'RPC de transferência ainda acessível para %', role_name;
    end if;
    foreach table_name in array array['stock_transfers', 'stock_transfer_items', 'stock_transfer_events'] loop
      foreach privilege_name in array array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'] loop
        if has_table_privilege(role_name, 'public.' || table_name, privilege_name) then
          raise exception 'Permissão % em % ainda concedida a %', privilege_name, table_name, role_name;
        end if;
      end loop;
    end loop;
  end loop;
end
$$;

set local role service_role;

do $$
begin
  perform count(*) from public.stock_transfers;
  perform count(*) from public.stock_transfer_items;
  perform count(*) from public.stock_transfer_events;

  begin
    perform public.save_transfer('{}'::jsonb);
    raise exception 'save_transfer deveria ser bloqueada';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.advance_transfer(null, 'aprovada', null, now());
    raise exception 'advance_transfer deveria ser bloqueada';
  exception when insufficient_privilege then null;
  end;
end
$$;

rollback;
