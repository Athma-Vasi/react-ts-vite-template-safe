const invalid_booleans = [null, void 0, 0, 1, "", "true", "false", [], {}];
const invalid_strings = [
    null,
    void 0,
    0,
    1,
    {},
    [],
    true,
    false,
];
const invalid_numbers = [
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

const valid_booleans = [true, false];
const valid_strings = [
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
const valid_passwords = [
    "password123Q!",
    "1234567890Qq!",
];
const valid_usernames = [
    "username-123",
    "username_123",
    "username.123",
];

const fetch_timeout_ms = 5000;
const async_timeout_ms = 10000;

const property_descriptor = {
    configurable: false,
    enumerable: true,
    writable: false,
};

export {
    async_timeout_ms,
    fetch_timeout_ms,
    invalid_booleans,
    invalid_numbers,
    invalid_strings,
    property_descriptor,
    valid_booleans,
    valid_passwords,
    valid_strings,
    valid_usernames,
};
