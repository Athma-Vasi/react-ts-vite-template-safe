type AccessibleButtonInputProps =
    & React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    >
    & {
        dataTestId?: string;
        disabledScreenreaderText?: string;
        enabledScreenreaderText?: string;
        label?: string;
        name: string;
    };
