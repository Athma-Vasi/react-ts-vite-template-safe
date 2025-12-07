import React from "react";

type AccessibleButtonInputProps<
    SetIsLoadingAction extends string = string,
    SetIsSubmittingAction extends string = string,
> =
    & React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    >
    & {
        dataTestId?: string;
        disabledScreenreaderText?: string;
        enabledScreenreaderText?: string;
        isIconAsLabel?: boolean;
        label?: string;
        name: string;
        setIsLoadingAction?: SetIsLoadingAction;
        setIsSubmittingAction?: SetIsSubmittingAction;
    };

function AccessibleButtonInput<
    SetIsLoadingAction extends string = string,
    SetIsSubmittingAction extends string = string,
>(
    props: AccessibleButtonInputProps<
        SetIsLoadingAction,
        SetIsSubmittingAction
    >,
) {
    const {
        name,
        dataTestId = `accessible-button-input-${name}`,
        disabled = false,
        disabledScreenreaderText = "",
        enabledScreenreaderText = "",
        isIconAsLabel = false,
        label = `${name.charAt(0).toUpperCase()}${name.slice(1)}`,
        setIsLoadingAction,
        setIsSubmittingAction,
        type = "button",
        ...restButtonProps
    } = props;

    const enabledTextElementId = `${name}-button-enabled-text`;
    const disabledTextElementId = `${name}-button-disabled-text`;
    const { describedById, screenreaderTextElement } =
        createAccessibleButtonInputValidation({
            disabled,
            disabledScreenreaderText,
            disabledTextElementId,
            enabledScreenreaderText,
            enabledTextElementId,
            label,
        });

    const button = (
        <button
            aria-describedby={describedById}
            data-testid={dataTestId}
            aria-label={label}
            disabled={disabled}
            type={type}
            {...restButtonProps}
        >
            {isIconAsLabel ? null : label}
        </button>
    );

    return (
        <div className="accessible-button-input">
            {button}
            {screenreaderTextElement}
        </div>
    );
}

function createAccessibleButtonInputValidation(
    {
        disabled,
        disabledScreenreaderText,
        disabledTextElementId,
        enabledScreenreaderText,
        enabledTextElementId,
        label,
    }: {
        disabled: boolean;
        disabledScreenreaderText?: string;
        disabledTextElementId: string;
        enabledScreenreaderText?: string;
        enabledTextElementId: string;
        label: string;
    },
): {
    describedById: string;
    screenreaderTextElement: React.JSX.Element;
} {
    const enabledText = enabledScreenreaderText
        ? enabledScreenreaderText
        : `All form inputs are valid. ${label} button is enabled. Press Enter to submit the form.`;
    const enabledTextElement = (
        <p
            aria-live="polite"
            className={"visually-hidden"}
            id={enabledTextElementId}
        >
            {enabledText}
        </p>
    );

    const disabledText = disabledScreenreaderText
        ? disabledScreenreaderText
        : `Some form inputs are invalid. ${label} button is disabled. Please correct the invalid inputs to enable the button.`;
    const disabledTextElement = (
        <p
            aria-live="polite"
            className={"visually-hidden"}
            id={disabledTextElementId}
        >
            {disabledText}
        </p>
    );

    return {
        describedById: disabled ? disabledTextElementId : enabledTextElementId,
        screenreaderTextElement: disabled
            ? disabledTextElement
            : enabledTextElement,
    };
}

export { AccessibleButtonInput };
export type { AccessibleButtonInputProps };
