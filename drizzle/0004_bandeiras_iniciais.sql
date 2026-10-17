-- Bandeiras iniciais (confirmadas pelo dono em 16/10/2026). O dono pode editar depois.
INSERT INTO "bandeiras" ("nome", "tipo", "ordem") VALUES
  ('Visa', 'debito', 1),
  ('Mastercard', 'debito', 2),
  ('Elo', 'debito', 3),
  ('Visa', 'credito', 1),
  ('Mastercard', 'credito', 2),
  ('Elo', 'credito', 3),
  ('Hipercard', 'credito', 4),
  ('Amex', 'credito', 5)
ON CONFLICT ("nome", "tipo") DO NOTHING;
