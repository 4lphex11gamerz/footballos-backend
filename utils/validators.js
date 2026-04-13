export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePosition = (position) => {
  const validPositions = ['GK', 'DEF', 'MID', 'FWD'];
  return validPositions.includes(position);
};

export const validateSubscriptionPlan = (plan) => {
  const validPlans = ['FREE', 'PREMIUM', 'PRO'];
  return validPlans.includes(plan);
};

export const validateUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateWorkoutIntensity = (intensity) => {
  const validIntensities = ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'];
  return validIntensities.includes(intensity);
};

export const validateSkillLevel = (level) => {
  return level >= 1 && level <= 20 && Number.isInteger(level);
};
