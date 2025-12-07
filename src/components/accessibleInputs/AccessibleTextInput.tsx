import React, { type JSX } from "react";
import type { ValidationRegexes } from "../../types";
import { capitalizeString } from "../../utils";

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
        name,
        dataTestId = `accessible-text-input-${name}`,
        dispatch,
        disableValidationScreenreaderText,
        errorAction,
        errorDispatch,
        hideLabel = false,
        label = capitalizeString(name),
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

    const invalidValueElementId = `${name}-text-input__validation--invalid`;
    const validValueElementId = `${name}-text-input__validation--valid`;
    const emptyValueElementId = `${name}-text-input__validation--empty`;

    const { screenreaderTextElement, describedById } =
        createAccessibleTextInputValidation({
            emptyValueElementId,
            invalidValueElementId,
            isInputFocused,
            isValueValid,
            name,
            validValueElementId,
            validationRegexes,
            value,
        });

    const labelElement = (
        <label
            className={hideLabel ? "visually-hidden" : ""}
            htmlFor={name}
        >
            {label}
        </label>
    );

    const textInputElement = (
        <input
            aria-describedby={describedById}
            aria-errormessage={invalidValueElementId}
            aria-invalid={!isValueValid}
            aria-label={label}
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
            {labelElement}
            {textInputElement}
            {disableValidationScreenreaderText ? null : screenreaderTextElement}
        </div>
    );
}

function createAccessibleTextInputValidation(
    {
        emptyValueElementId,
        invalidValueElementId,
        isInputFocused,
        isValueValid,
        name,
        validValueElementId,
        validationRegexes,
        value,
    }: {
        emptyValueElementId: string;
        invalidValueElementId: string;
        isInputFocused: boolean;
        isValueValid: boolean;
        name: string;
        validValueElementId: string;
        validationRegexes: ValidationRegexes;
        value: string;
    },
): {
    describedById: string;
    screenreaderTextElement: JSX.Element;
} {
    const capitalizedName = capitalizeString(name);

    const showInvalidValueElement = isInputFocused && !isValueValid;
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
    const invalidValueElement = (
        <p
            aria-live="polite"
            className={showInvalidValueElement
                ? "text-input__validation"
                : "visually-hidden"}
            id={invalidValueElementId}
            style={{ color: "red", paddingTop: "0.25rem" }}
        >
            {invalidValueText}
        </p>
    );

    const showValidValueElement = isInputFocused && isValueValid;
    const validValueText = `${capitalizedName} is valid!`;
    const validValueElement = (
        <p
            aria-live="polite"
            className={showValidValueElement
                ? "text-input__validation"
                : "visually-hidden"}
            id={validValueElementId}
            style={{ color: "green", paddingTop: "0.25rem" }}
        >
            {validValueText}
        </p>
    );

    const showEmptyValueElement = isInputFocused && value.length === 0;
    const emptyValueText = `${capitalizedName} is empty.`;
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
        describedById: showInvalidValueElement
            ? invalidValueElementId
            : showEmptyValueElement
            ? emptyValueElementId
            : validValueElementId,
        screenreaderTextElement: showInvalidValueElement
            ? invalidValueElement
            : showEmptyValueElement
            ? emptyValueElement
            : validValueElement,
    };
}

export { AccessibleTextInput };
