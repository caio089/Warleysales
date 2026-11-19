update storage.buckets
set allowed_mime_types = array(
  select distinct unnest(coalesce(allowed_mime_types, array[]::text[]) || array[
    'application/zip',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet'
  ])
)
where id = 'process-documents';
