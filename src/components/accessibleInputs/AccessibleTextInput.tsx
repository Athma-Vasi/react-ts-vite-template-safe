import React, { type JSX } from "react";
import type { ValidationRegexes } from "../../types";

type AccessibleTextInputProps<
    SetValueAction extends string = string,
    Payload extends string = string,
    SetLastActiveInputAction extends string = string,
    Name extends string = string,
    Dispatch = {
        action: SetValueAction | SetLastActiveInputAction;
        payload: Payload;
    },
    ErrorAction extends string = string,
> =
    & React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    >
    & {
        dataTestId?: string;
        disableValidationScreenreaderText?: boolean;
        dispatch: React.ActionDispatch<[dispatch: Dispatch]>;
        errorAction: ErrorAction;
        errorDispatch: React.ActionDispatch<[dispatch: {
            action: ErrorAction;
            payload: Record<string, Payload | Name>;
        }]>;
        hideLabel?: boolean;
        label?: string;
        name: string;
        setLastActiveInputAction: SetLastActiveInputAction;
        setValueAction: SetValueAction;
        validationRegexes?: ValidationRegexes;
        value: Payload;
    };

function AccessibleTextInput<
    SetValueAction extends string = string,
    Payload extends string = string,
    SetLastActiveInputAction extends string = string,
    Name extends string = string,
    Dispatch = {
        action: SetValueAction | SetLastActiveInputAction;
        payload: Payload | Name;
    },
    ErrorAction extends string = string,
>(
    props: AccessibleTextInputProps<
        SetValueAction,
        Payload,
        SetLastActiveInputAction,
        Name,
        Dispatch,
        ErrorAction
    >,
) {
    const {
        dispatch,
        disableValidationScreenreaderText,
        errorAction,
        errorDispatch,
        name,
        dataTestId = `accessible-text-input-${name}`,
        hideLabel = false,
        label = name,
        onBlur = () => {},
        onChange = () => {},
        onFocus = () => {},
        setLastActiveInputAction,
        setValueAction,
        validationRegexes = [],
        value = "",
        ...textInputProps
    } = props;

    const [isInputFocused, setIsInputFocused] = React.useState(false);

    const isValueValid = value.length === 0 || validationRegexes.every(
        ([regex, _message]) => regex.test(value),
    );
    const { screenreaderTextElement, describedByIds } =
        createAccessibleTextInputValidation({
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
            className={!isValueValid
                ? "input--error-state"
                : value.length === 0
                ? "input--empty-state"
                : "input--valid-state"}
            data-testid={dataTestId}
            name={name}
            onBlur={(event: React.FocusEvent<HTMLInputElement, Element>) => {
                setIsInputFocused(false);
                onBlur?.(event);
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { currentTarget: { value } } = event;

                dispatch({
                    action: setValueAction,
                    payload: value as Payload,
                } as Dispatch);
                dispatch({
                    action: setLastActiveInputAction,
                    payload: name as Name,
                } as Dispatch);

                errorDispatch({
                    action: errorAction,
                    payload: {
                        [name]: value as Payload,
                        "lastActiveInput": name as Payload,
                    },
                });

                onChange?.(event);
            }}
            onFocus={(event: React.FocusEvent<HTMLInputElement, Element>) => {
                setIsInputFocused(true);
                onFocus?.(event);
            }}
            size={100}
            value={value}
            {...textInputProps}
        />
    );

    return (
        <div className="accessible-text-input">
            {hideLabel ? null : labelElement}
            {textInputElement}
            {disableValidationScreenreaderText ? null : screenreaderTextElement}
        </div>
    );
}

function createAccessibleTextInputValidation(
    { isInputFocused, isValueValid, name, validationRegexes, value }: {
        isInputFocused: boolean;
        isValueValid: boolean;
        name: string;
        validationRegexes: ValidationRegexes;
        value: string;
    },
): {
    describedByIds: string;
    screenreaderTextElement: JSX.Element;
} {
    const capitalizedName = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;

    const shouldShowInvalidValueElement = isInputFocused && !isValueValid;
    const invalidValueText = validationRegexes.reduce(
        (acc, [regex, message]) => {
            const isValid = regex.test(value);
            if (!isValid) {
                acc += `${message} `;
            }

            return acc;
        },
        `${capitalizedName} is invalid. `,
    ).trim();
    const invalidValueElementId = `${name}-text-input__validation--invalid`;
    const invalidValueElement = (
        <p
            aria-live="polite"
            className={shouldShowInvalidValueElement
                ? "text-input__validation"
                : "visually-hidden"}
            id={invalidValueElementId}
            style={{ color: "red", paddingTop: "0.25rem" }}
        >
            {invalidValueText}
        </p>
    );

    const shouldShowValidValueElement = isInputFocused && isValueValid;
    const validValueText = `${capitalizedName} is valid!`;
    const validValueElementId = `${name}-text-input__validation--valid`;
    const validValueElement = (
        <p
            aria-live="polite"
            className={shouldShowValidValueElement
                ? "text-input__validation"
                : "visually-hidden"}
            id={validValueElementId}
            style={{ color: "green", paddingTop: "0.25rem" }}
        >
            {validValueText}
        </p>
    );

    const shouldShowEmptyValueElement = isInputFocused && value.length === 0;
    const emptyValueText = `${capitalizedName} is empty.`;
    const emptyValueElementId = `${name}-text-input__validation--empty`;
    const emptyValueElement = (
        <p
            aria-live="polite"
            className="visually-hidden"
            id={emptyValueElementId}
            style={{ color: "gray", paddingTop: "0.25rem" }}
        >
            {emptyValueText}
        </p>
    );

    return {
        describedByIds:
            `${invalidValueElementId} ${validValueElementId} ${emptyValueElementId}`,
        screenreaderTextElement: shouldShowInvalidValueElement
            ? invalidValueElement
            : shouldShowEmptyValueElement
            ? emptyValueElement
            : validValueElement,
    };
}

export { AccessibleTextInput };
