const INVALID_BOOLEANS = [null, void 0, 0, 1, "", "true", "false", [], {}];
const INVALID_STRINGS = [
    null,
    void 0,
    0,
    1,
    {},
    [],
    true,
    false,
];
const INVALID_NUMBERS = [
    null,
    void 0,
    "",
    "0",
    "1",
    true,
    false,
    {},
    [],
];

const VALID_BOOLEANS = [true, false];
const VALID_STRINGS = [
    "true",
    "false",
    "True",
    "False",
    "valid",
    "valid with spaces",
    "valid with special characters !@#$%^&*()_+",
    "valid with numbers 1234567890",
    "valid with numbers and special characters 1234567890!@#$%^&*()_+",
    "valid with numbers and spaces 1234567890 ",
    "valid with numbers, spaces and special characters 1234567890 !@#$%^&*()_+",
    "valid with spaces and special characters !@#$%^&*()_+",
];
const VALID_PASSWORDS = [
    "password123Q!",
    "1234567890Qq!",
];
const VALID_USERNAMES = [
    "username-123",
    "username_123",
    "username.123",
];

const FETCH_TIMEOUT_MS = 15000;

export {
    FETCH_TIMEOUT_MS,
    INVALID_BOOLEANS,
    INVALID_NUMBERS,
    INVALID_STRINGS,
    VALID_BOOLEANS,
    VALID_PASSWORDS,
    VALID_STRINGS,
    VALID_USERNAMES,
};
