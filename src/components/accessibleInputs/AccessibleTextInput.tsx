import React from "react";

type AccessibleTextInputProps<
    Action extends string = string,
    Payload extends string = string,
> =
    & React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    >
    & {
        action: Action;
        dataTestId?: string;
        dispatch: React.Dispatch<{
            action: Action;
            payload: Payload;
        }>;
        hideLabel?: boolean;
        label?: string;
        name: string;
        validationRegexes?: Array<[RegExp, string]>;
        value: Payload;
    };

function AccessibleTextInput(
    props: AccessibleTextInputProps,
) {
    const {
        action,
        dispatch,
        name,
        dataTestId = `accessible-text-input-${name}`,
        hideLabel = false,
        label = name,
        onBlur = () => {},
        onChange = () => {},
        onFocus = () => {},
        validationRegexes = [],
        value = "",
        ...textInputProps
    } = props;

    const [isInputFocused, setIsInputFocused] = React.useState(false);

    const isValueValid = value.length === 0 || validationRegexes.every(
        ([regex, _message]) => regex.test(value),
    );
    const { screenreaderTextElement, describedByIds } =
        createValidationScreenreaderElement({
            isInputFocused,
            isValueValid,
            name,
            validationRegexes,
            value,
        });

    const labelElement = (
        <label
            htmlFor={dataTestId}
            className={hideLabel ? "visually-hidden" : ""}
        >
            {label}
        </label>
    );

    const textInputElement = (
        <input
            aria-describedby={describedByIds}
            aria-errormessage={`${name}-invalid-text`}
            aria-invalid={!isValueValid}
            name={name}
            onBlur={(event: React.FocusEvent<HTMLInputElement, Element>) => {
                setIsInputFocused(false);
                onBlur?.(event);
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                dispatch({
                    action,
                    payload: event.currentTarget.value,
                });
                onChange?.(event);
            }}
            onFocus={(event: React.FocusEvent<HTMLInputElement, Element>) => {
                setIsInputFocused(true);
                onFocus?.(event);
            }}
            value={value}
            data-testid={dataTestId}
            {...textInputProps}
        />
    );

    return (
        <div className="accessible-input">
            {labelElement}
            {textInputElement}
            {screenreaderTextElement}
        </div>
    );
}

function createValidationScreenreaderElement(
    { isInputFocused, isValueValid, name, validationRegexes, value }: {
        isInputFocused: boolean;
        isValueValid: boolean;
        name: string;
        validationRegexes: Array<[RegExp, string]>;
        value: string;
    },
) {
    const shouldShowInvalidValueElement = isInputFocused && !isValueValid;
    const invalidValueText = validationRegexes.reduce(
        (acc, [regex, message]) => {
            if (!regex.test(value)) {
                acc += `${message}. `;
            }

            return acc;
        },
        `${name} is invalid. `,
    ).trim();

    const invalidValueElement = (
        <p
            aria-live="polite"
            className={shouldShowInvalidValueElement ? "" : "visually-hidden"}
            id={`${name}-invalid-text`}
            style={{ color: "red", marginTop: "0.25rem" }}
        >
            {invalidValueText}
        </p>
    );

    const shouldShowValidValueElement = isInputFocused && isValueValid;
    const validValueText = `${name} is valid!`;
    const validValueElement = (
        <p
            aria-live="polite"
            className={shouldShowValidValueElement ? "" : "visually-hidden"}
            id={`${name}-valid-text`}
            style={{ color: "green", marginTop: "0.25rem" }}
        >
            {validValueText}
        </p>
    );

    const shouldShowEmptyValueElement = isInputFocused && value.length === 0;
    const emptyValueText = `${name} is empty.`;
    const emptyValueElement = (
        <p
            aria-live="polite"
            className="visually-hidden"
            id={`${name}-empty-text`}
            style={{ color: "gray", marginTop: "0.25rem" }}
        >
            {emptyValueText}
        </p>
    );

    return {
        screenreaderTextElement: shouldShowInvalidValueElement
            ? invalidValueElement
            : shouldShowEmptyValueElement
            ? emptyValueElement
            : validValueElement,
        describedByIds:
            `${name}-invalid-text ${name}-valid-text ${name}-empty-text`,
    };
}

export { AccessibleTextInput };
