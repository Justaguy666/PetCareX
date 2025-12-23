export const success = (data = null, message = 'Success') => ({
  success: true,
  message,
  data
});

export const error = (message = 'Error', errors = null) => ({
  success: false,
  message,
  errors
});

export const validationError = (zodError) => ({
  success: false,
  message: 'Validation failed',
  errors: zodError.errors.map(e => ({
    field: e.path.join('.'),
    message: e.message
  }))
});
