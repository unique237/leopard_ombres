CREATE POLICY "anon_upload_payment_proof" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "anon_read_payment_proof" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'payment-proofs');

CREATE POLICY "auth_upload_payment_proof" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "auth_read_payment_proof" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs');
