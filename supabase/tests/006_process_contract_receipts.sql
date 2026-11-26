begin;
do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); org uuid := gen_random_uuid(); other_org uuid := gen_random_uuid();
  material uuid := gen_random_uuid(); proc uuid := gen_random_uuid(); ata uuid := gen_random_uuid(); ata_item uuid := gen_random_uuid();
  ca uuid := gen_random_uuid(); cb uuid := gen_random_uuid(); ra uuid := gen_random_uuid(); rb uuid := gen_random_uuid();
  ia uuid := gen_random_uuid(); ib uuid := gen_random_uuid(); other_contract uuid := gen_random_uuid();
  other_item uuid := gen_random_uuid(); other_request_item uuid := gen_random_uuid(); outcome jsonb;
begin
  insert into auth.users(id) values(a),(b);
  insert into public.councils(id,name,acronym) values(org,'Órgão A 006','OA006'),(other_org,'Órgão B 006','OB006');
  insert into public.council_memberships(user_id,council_id,role) values(a,org,'council_manager'),(b,other_org,'council_manager');
  insert into public.materials(id,code,name,unit) values(material,'ITEM006','Item 006','un');
  insert into public.administrative_processes(id,council_id,sequence,year,number,title,created_by,contracting_mode,responsible_id,process_type)
    values(proc,org,6006,2026,'6006/2026','Processo 006',a,'registro_precos',a,'Tipo informado');
  assert (select responsible_id=a and process_type='Tipo informado' from public.administrative_processes where id=proc);
  begin
    update public.administrative_processes set responsible_id=b where id=proc;
    raise exception 'Aceitou responsável de outro órgão';
  exception when check_violation then null;
  end;
  insert into public.price_registration_atas(id,council_id,process_id,number,start_date,status)
    values(ata,org,proc,'ATA-006',current_date,'vigente');
  insert into public.ata_items(id,ata_id,description,material_id,registered_quantity,unit_price)
    values(ata_item,ata,'Item 006',material,10,1);
  outcome := public.create_contract_with_ata(jsonb_build_object('id',ca,'council_id',org,'process_id',proc,'ata_id',ata,'number','C-A-006','object','Item 006','created_at',now(),'start_date',current_date,'end_date',current_date+30,'value',4,'ata_items',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'ata_item_id',ata_item,'quantity',4,'unit_price',1))));
  assert outcome->>'ok'='true';
  outcome := public.create_contract_with_ata(jsonb_build_object('id',cb,'council_id',org,'process_id',proc,'ata_id',ata,'number','C-B-006','object','Item 006','created_at',now(),'start_date',current_date,'end_date',current_date+30,'value',6,'ata_items',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'ata_item_id',ata_item,'quantity',6,'unit_price',1))));
  assert outcome->>'ok'='true';
  insert into public.purchase_requests(id,council_id,process_id,title,status,created_by) values
    (ra,org,proc,'Solicitação A','aprovada',a),(rb,org,proc,'Solicitação B','aprovada',a);
  insert into public.purchase_request_items(id,request_id,material_id,quantity,ata_item_id) values
    (ia,ra,material,5,ata_item),(ib,rb,material,6,ata_item);
  insert into public.contracts(id,council_id,number,object,start_date,end_date,value)
    values(other_contract,other_org,'C-OUT-006','Contrato de outro órgão',current_date,current_date+30,1);
  outcome := public.receive_purchase_request_for_contract(ra,other_contract,a,now(),'recibo-org-006',jsonb_build_array(jsonb_build_object('item_id',ia,'received',1)));
  assert outcome->>'code'='VALIDATION', 'Contrato de outro órgão deve ser rejeitado';
  insert into public.ata_items(id,ata_id,description,material_id,registered_quantity,unit_price)
    values(other_item,ata,'Outro item',material,1,1);
  insert into public.purchase_request_items(id,request_id,material_id,quantity,ata_item_id)
    values(other_request_item,ra,material,1,other_item);
  outcome := public.receive_purchase_request_for_contract(ra,ca,a,now(),'recibo-item-006',jsonb_build_array(jsonb_build_object('item_id',other_request_item,'received',1)));
  assert outcome->>'code'='VALIDATION', 'Item da ata fora do contrato deve ser rejeitado';
  outcome := public.receive_purchase_request_for_contract(ra,ca,a,now(),'recibo-a-006',jsonb_build_array(jsonb_build_object('item_id',ia,'received',4)));
  assert outcome->>'ok'='true', 'Contrato A deve receber 4';
  assert (select sum(quantity)=4 from public.contract_receipt_lines where contract_id=ca);
  outcome := public.receive_purchase_request_for_contract(rb,ca,a,now(),'recibo-erro-006',jsonb_build_array(jsonb_build_object('item_id',ib,'received',6)));
  assert outcome->>'code'='VALIDATION', 'Contrato A não pode receber a quantidade do contrato B';
  outcome := public.receive_purchase_request_for_contract(rb,cb,a,now(),'recibo-b-006',jsonb_build_array(jsonb_build_object('item_id',ib,'received',6)));
  assert outcome->>'ok'='true', 'Contrato B deve receber 6';
  assert (select sum(quantity)=6 from public.contract_receipt_lines where contract_id=cb);
  outcome := public.receive_purchase_request_for_contract(ra,ca,a,now(),'recibo-excesso-006',jsonb_build_array(jsonb_build_object('item_id',ia,'received',1)));
  assert outcome->>'code'='VALIDATION', 'Excesso do contrato A deve ser rejeitado';
  assert (select received_total=4 from public.purchase_request_items where id=ia);
  assert (select count(*)=0 from public.stock_movements where idempotency_key='receipt:recibo-excesso-006:'||ia);
  outcome := public.receive_purchase_request_for_contract(ra,ca,a,now(),'recibo-a-006',jsonb_build_array(jsonb_build_object('item_id',ia,'received',4)));
  assert outcome->>'ok'='true', 'Reenvio idempotente';
  outcome := public.receive_purchase_request_for_contract(ra,cb,a,now(),'recibo-a-006',jsonb_build_array(jsonb_build_object('item_id',ia,'received',4)));
  assert outcome->>'code'='CONFLICT', 'Reenvio não pode trocar o contrato';
  assert (select count(*)=2 and sum(quantity)=10 from public.stock_movements where council_id=org and type='entry');
  assert (select physical=10 from public.stock_balances where council_id=org and material_id=material);
  update public.contracts set closed_at=now(),closed_by=a where id=ca;
  assert (select closed_at is not null and closed_by=a from public.contracts where id=ca);
  assert (select closed_at is null from public.contracts where id=cb);
  set local role authenticated;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',a)::text,true);
  assert (select count(*)=2 from public.contract_receipt_lines where contract_id in (ca,cb));
  perform set_config('request.jwt.claims',jsonb_build_object('sub',b)::text,true);
  assert (select count(*)=0 from public.contract_receipt_lines where contract_id in (ca,cb));
  assert not has_function_privilege('public.receive_purchase_request_for_contract(uuid,uuid,uuid,timestamptz,text,jsonb,boolean,text)','EXECUTE');
  assert not has_table_privilege('public.contract_receipt_lines','INSERT');
  reset role;
end $$;
rollback;
