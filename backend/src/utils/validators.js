const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

export const validateEmail = (email) => isNonEmptyString(email) && emailRegex.test(email.trim());

export const validateOrder = (value) => Number.isInteger(value) && value >= 0;

export const validateObjectId = (value) => typeof value === 'string' && value.trim().length === 24;
