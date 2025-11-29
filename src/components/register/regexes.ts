import type { ValidationRegexes } from "../../types";

const username_validation_regexes: ValidationRegexes = [
    [/.{3,}/, "Username must be at least 3 characters long."],
    [
        /^[a-zA-Z0-9._-]+$/,
        "Username can only contain letters, numbers, dots, underscores, and hyphens.",
    ],
    [/^\S+$/, "Username cannot contain spaces."],
    [
        /^[^\s!@#$%^&*()+=\[\]{};':"\\|,.<>\/?`~]+$/,
        "Username cannot contain special characters.",
    ],
    [/^[a-zA-Z]/, "Username must start with a letter."],
    [
        /^[a-zA-Z0-9._-]+[a-zA-Z0-9]$/,
        "Username must end with a letter or number.",
    ],
    [
        /^(?!.*[._-]{2})/,
        "Username cannot contain consecutive dots, underscores, or hyphens.",
    ],
    [/^(?!.*[._-]$)/, "Username cannot end with a dot, underscore, or hyphen."],
];

const password_validation_regexes: ValidationRegexes = [
    [/.{8,}/, "Password must be at least 8 characters long."],
    [/[A-Z]/, "Password must contain at least one uppercase letter."],
    [/[a-z]/, "Password must contain at least one lowercase letter."],
    [/[0-9]/, "Password must contain at least one number."],
    [
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character.",
    ],
    [/^\S+$/, "Password cannot contain spaces."],
];

export { password_validation_regexes, username_validation_regexes };
