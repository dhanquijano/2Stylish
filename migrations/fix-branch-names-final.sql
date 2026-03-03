-- Update all appointments with "Sanbry Main Branch" to "Ayala Malls Circuit"
UPDATE appointments 
SET branch = 'Ayala Malls Circuit' 
WHERE branch = 'Sanbry Main Branch';

-- Verify the update
SELECT id, "appointmentDate", "appointmentTime", barber, branch, "fullName"
FROM appointments 
WHERE "appointmentDate" = '2026-02-18' AND barber = 'Juan Dela Cruz';
