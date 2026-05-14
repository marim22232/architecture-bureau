// my-architecture-api/utils/errors.js
export const ErrorTypes = {
    // Валидация
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    MISSING_FIELDS: 'MISSING_FIELDS',
    INVALID_EMAIL: 'INVALID_EMAIL',
    INVALID_PHONE: 'INVALID_PHONE',
    WEAK_PASSWORD: 'WEAK_PASSWORD',
    
    // Бизнес-логика
    USER_EXISTS: 'USER_EXISTS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    INVALID_VERIFICATION_CODE: 'INVALID_VERIFICATION_CODE',
    ACCOUNT_BLOCKED: 'ACCOUNT_BLOCKED',
    ACCOUNT_NOT_VERIFIED: 'ACCOUNT_NOT_VERIFIED',
    
    // Серверные ошибки
    DATABASE_ERROR: 'DATABASE_ERROR',
    EMAIL_SEND_ERROR: 'EMAIL_SEND_ERROR',
    SMS_SEND_ERROR: 'SMS_SEND_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
};

export class AppError extends Error {
    constructor(type, message, statusCode = 400, details = null) {
        super(message);
        this.type = type;
        this.statusCode = statusCode;
        this.details = details;
    }
}

// Фабрика ошибок
export const Errors = {
    validation: (field, message) => new AppError(
        ErrorTypes.VALIDATION_ERROR,
        `Ошибка валидации поля ${field}: ${message}`,
        400,
        { field, message }
    ),
    
    missingFields: (fields) => new AppError(
        ErrorTypes.MISSING_FIELDS,
        `Обязательные поля: ${fields.join(', ')}`,
        400,
        { missingFields: fields }
    ),
    
    invalidEmail: () => new AppError(
        ErrorTypes.INVALID_EMAIL,
        'Некорректный формат email',
        400
    ),
    
    invalidPhone: () => new AppError(
        ErrorTypes.INVALID_PHONE,
        'Некорректный формат номера телефона. Используйте формат +7 (999) 123-45-67',
        400
    ),
    
    weakPassword: () => new AppError(
        ErrorTypes.WEAK_PASSWORD,
        'Пароль должен содержать минимум 6 символов',
        400
    ),
    
    userExists: () => new AppError(
        ErrorTypes.USER_EXISTS,
        'Пользователь с таким email или телефоном уже существует',
        409
    ),
    
    userNotFound: () => new AppError(
        ErrorTypes.USER_NOT_FOUND,
        'Пользователь не найден',
        404
    ),
    
    invalidCredentials: () => new AppError(
        ErrorTypes.INVALID_CREDENTIALS,
        'Неверный логин или пароль',
        401
    ),
    
    invalidVerificationCode: () => new AppError(
        ErrorTypes.INVALID_VERIFICATION_CODE,
        'Неверный или просроченный код подтверждения',
        400
    ),
    
    accountBlocked: (reason) => new AppError(
        ErrorTypes.ACCOUNT_BLOCKED,
        `Аккаунт заблокирован. Причина: ${reason || 'Не указана'}`,
        403
    ),
    
    accountNotVerified: () => new AppError(
        ErrorTypes.ACCOUNT_NOT_VERIFIED,
        'Аккаунт не подтверждён. Подтвердите email или телефон',
        403
    ),
    
    databaseError: (originalError) => new AppError(
        ErrorTypes.DATABASE_ERROR,
        'Ошибка базы данных',
        500,
        { originalError: originalError.message }
    ),
    
    internal: (message = 'Внутренняя ошибка сервера') => new AppError(
        ErrorTypes.INTERNAL_ERROR,
        message,
        500
    )
};