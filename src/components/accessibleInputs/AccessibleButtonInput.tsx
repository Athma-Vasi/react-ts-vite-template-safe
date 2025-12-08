import React, { type ReactNode } from "react";
import { BiDislike, BiLike } from "react-icons/bi";
import {
    TbArrowDown,
    TbArrowUp,
    TbCircleArrowDown,
    TbCircleArrowUp,
    TbClearAll,
    TbDownload,
    TbEdit,
    TbFilter,
    TbFolderOpen,
    TbHelp,
    TbLoader2,
    TbLogout,
    TbMessageCirclePlus,
    TbMessageReport,
    TbPlayerPauseFilled,
    TbPlayerPlayFilled,
    TbPlus,
    TbQuote,
    TbRefresh,
    TbRowInsertTop,
    TbSearch,
    TbStar,
    TbTrash,
    TbUpload,
} from "react-icons/tb";
import { TiArrowLeftThick, TiArrowRightThick } from "react-icons/ti";
import { VscCollapseAll, VscExpandAll } from "react-icons/vsc";
import { capitalizeString } from "../../utils";

type AccessibleButtonKind =
    | "add"
    | "collapse"
    | "default"
    | "delete"
    | "dislike"
    | "down"
    | "download"
    | "edit"
    | "expand"
    | "filter"
    | "help"
    | "hide"
    | "insert"
    | "like"
    | "logout"
    | "next"
    | "open"
    | "pause"
    | "play"
    | "previous"
    | "quote"
    | "rate"
    | "refresh"
    | "reply"
    | "report"
    | "reset"
    | "search"
    | "show"
    | "star"
    | "submit"
    | "up";

const left_icon_table: Record<AccessibleButtonKind, ReactNode> = {
    add: <TbPlus size={18} />,
    collapse: <VscCollapseAll size={18} />,
    default: null,
    delete: <TbTrash size={18} />,
    dislike: <BiDislike size={18} />,
    down: <TbCircleArrowDown size={18} />,
    download: <TbDownload size={18} />,
    edit: <TbEdit size={18} />,
    expand: <VscExpandAll size={18} />,
    filter: <TbFilter size={18} />,
    insert: <TbRowInsertTop size={18} />,
    help: <TbHelp size={18} />,
    hide: <TbArrowDown size={18} />,
    like: <BiLike size={18} />,
    logout: <TbLogout size={18} />,
    next: <TiArrowRightThick size={18} />,
    open: <TbFolderOpen size={18} />,
    pause: <TbPlayerPauseFilled size={18} />,
    play: <TbPlayerPlayFilled size={18} />,
    previous: <TiArrowLeftThick size={18} />,
    quote: <TbQuote size={18} />,
    rate: <TbStar size={18} />,
    refresh: <TbRefresh size={18} />,
    reply: <TbMessageCirclePlus size={18} />,
    report: <TbMessageReport size={18} />,
    reset: <TbClearAll size={18} />,
    search: <TbSearch size={18} />,
    show: <TbArrowUp size={18} />,
    star: <TbStar size={18} />,
    submit: <TbUpload size={18} />,
    up: <TbCircleArrowUp size={18} />,
};

type AccessibleButtonInputProps<
    SetIsLoadingAction extends string = string,
    Dispatch = {
        action: SetIsLoadingAction;
        payload: boolean;
    },
> =
    & React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    >
    & {
        dataTestId?: string;
        disabledScreenreaderText?: string;
        dispatch?: React.ActionDispatch<[dispatch: Dispatch]>;
        enabledScreenreaderText?: string;
        isIconAsLabel?: boolean;
        isLoading?: boolean;
        isSubmitting?: boolean;
        kind?: AccessibleButtonKind;
        label?: string;
        name: string;
        setIsLoadingAction: SetIsLoadingAction;
    };

function AccessibleButtonInput<
    SetIsLoadingAction extends string = string,
    Dispatch = {
        action: SetIsLoadingAction;
        payload: boolean;
    },
>(
    props: AccessibleButtonInputProps<
        SetIsLoadingAction,
        Dispatch
    >,
) {
    const {
        name,
        dataTestId = `accessible-button-input-${name}`,
        disabled = false,
        disabledScreenreaderText = "",
        dispatch,
        enabledScreenreaderText = "",
        isIconAsLabel = false,
        isLoading = false,
        isSubmitting = false,
        kind = "default",
        label = capitalizeString(name),
        onClick = () => {},
        setIsLoadingAction,
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
            onClick={(
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
            ) => {
                dispatch?.({
                    action: setIsLoadingAction,
                    payload: true,
                } as Dispatch);

                onClick?.(event);
            }}
            type={type}
            {...restButtonProps}
        >
            {isIconAsLabel ? left_icon_table[kind] : (
                <span>
                    {isLoading
                        ? <TbLoader2 className="button-loader" size={18} />
                        : left_icon_table[kind]} {label}
                </span>
            )}
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
