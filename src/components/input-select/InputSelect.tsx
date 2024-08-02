import React, { useEffect, useRef, useState } from "react";
import arrowIcon from "../../assets/arrow-icon.svg";
import closeIcon from "../../assets/close-icon.svg";

export type SelectOption = {
    label: string;
    value: string;
};
export type ValueChangeMeta = {
    value: SelectOption;
    action: "option-selected" | "option-deselected" | "option-created";
};
export type InputSelectProps = {
    options: Array<SelectOption>;
    value?: Array<SelectOption>;
    disabled?: boolean;
    loading?: boolean;

    onChange?: (newValue: Array<SelectOption>, metadata: ValueChangeMeta) => void;
    onBlur?: () => void;

    multiple?: boolean;
    searchable?: boolean;
    allowNewOptionsCreated?: boolean;
    onNewOptionsCreated?: (optValue: string) => void;
};

const generateOptionId = (option: SelectOption, listIndex: number) => {
    return `${option.label}-${option.value}-${listIndex}`;
};

// NEXT TODO: accessibility (keyboard events). Disabled & loading. Searchabilility off, not isMultiple
// infocus, onBlur,... essentially all the common props?
// for onblur, needs focus state
export function InputSelect(props: InputSelectProps) {
    const { options: optionsProp, value: valueProps = [], onChange } = props;

    const [prevValueProps, setPrevValueProps] = useState(valueProps);
    const [selectValue, setSelectValue] = useState(valueProps);
    if (valueProps && valueProps.length && valueProps !== prevValueProps) {
        // update based on props change
        setPrevValueProps(valueProps);
        setSelectValue(valueProps);
    }
    const [inputValue, setInputValue] = useState("");
    const { allowNewOptionsCreated, onNewOptionsCreated: onNewOptionsCreatedProp } = props;

    // ONLY CREATE NEW OPTION IT'S NOT ALREADY IN OPTIONS' VALUE OR LABEL or selectValue's value or label
    const isValidNewOptionValue = (optValue: string) => {
        optValue = optValue.trim();
        return !(
            !optValue ||
            optionsProp.find((opt) => opt.value === optValue) ||
            optionsProp.find((opt) => opt.label === optValue) ||
            selectValue.find((opt) => opt.value === optValue) ||
            selectValue.find((opt) => opt.label === optValue)
        );
    };

    const [menuOpen, setMenuOpen] = useState(false);
    // component: menulist dropdown, select control, search, indicator & arrow

    useEffect(() => {
        const closeMenu = (event: MouseEvent) => {
            if (
                event.target &&
                selectContainer.current &&
                !selectContainer.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, []);

    function onInputValueChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInputValue(e.target.value);
        if (!menuOpen) {
            setMenuOpen(true);
        }
    }

    function onNewOptionCreated(e: React.MouseEvent, optValue: string) {
        console.assert(optValue === inputValue);
        if (onNewOptionsCreatedProp) {
            onNewOptionsCreatedProp(optValue);
        }
        const newOpt: SelectOption = {
            label: optValue,
            value: optValue,
        };
        const nextSelectValue = [...selectValue, newOpt];
        const meta: ValueChangeMeta = {
            value: newOpt,
            action: "option-created",
        };
        setSelectValue(nextSelectValue);
        if (onChange) {
            onChange(nextSelectValue, meta);
        }
    }

    function onOptionSelected(e: React.MouseEvent, newOpt: SelectOption) {
        const nextSelectValue = [...selectValue, newOpt];
        const meta: ValueChangeMeta = {
            value: newOpt,
            action: "option-selected",
        };
        setSelectValue(nextSelectValue);
        if (onChange) {
            onChange(nextSelectValue, meta);
        }
    }
    function onOptionDeselected(e: React.MouseEvent, opt: SelectOption) {
        e.stopPropagation();
        const nextSelectValue = selectValue.filter((o) => o !== opt);
        const meta: ValueChangeMeta = {
            value: opt,
            action: "option-deselected",
        };
        setSelectValue(nextSelectValue);
        if (onChange) {
            onChange(nextSelectValue, meta);
        }
    }

    // check by reference
    function isOptionSelected(opt: SelectOption) {
        return (
            selectValue.includes(opt) || selectValue.findIndex((o) => o.value === opt.value) > -1
        );
    }
    function isOptionMatchedSearch(opt: SelectOption) {
        return (
            opt.label.toLowerCase().includes(inputValue.toLowerCase()) ||
            opt.value.toLowerCase().includes(inputValue.toLowerCase())
        );
    }

    const selectContainer = useRef<HTMLInputElement>(null);
    return (
        <>
            <div ref={selectContainer} className="relative">
                <div // CONTROL: SELECTED + INPUT SEARCH + INDICATORS
                    className={["flex border border-blue-600 w-72 p-1 bg-white"].join(" ")}
                    onClick={(e) => {
                        setMenuOpen(!menuOpen);
                    }}
                >
                    <div className="flex flex-auto flex-wrap cursor-default">
                        {selectValue.map((v, idx) => (
                            <div
                                className="text-sm inline-block p-px bg-gray-200 mr-[2px] mt-[2px] flex items-center"
                                key={idx}
                            >
                                <span className="px-px">{v.label}</span>
                                <button onClick={(e) => onOptionDeselected(e, v)}>
                                    <img className="size-3" src={closeIcon} />
                                </button>
                            </div>
                        ))}
                        <div className="flex-1">
                            <input
                                type="text"
                                className="outline-none min-w-2 w-full"
                                value={inputValue}
                                onChange={onInputValueChange}
                            />
                        </div>
                    </div>
                    <div className="flex flex-shrink-0">
                        <img className="size-3 m-auto" src={arrowIcon} />
                    </div>
                </div>

                {menuOpen && ( // MENU. TODO: HOW TO ONLY HIDE WHEN LOST FOCUS
                    <ul
                        className={[
                            "absolute top-[calc(100%+2px)] cursor-default max-h-24 w-full py-2 overflow-y-auto",
                            "bg-white border",
                        ].join(" ")}
                    >
                        {optionsProp.map((opt, idx) => (
                            <li
                                className={[
                                    isOptionSelected(opt) || !isOptionMatchedSearch(opt)
                                        ? "hidden"
                                        : "block",
                                    "hover:bg-gray-200 px-2",
                                ].join(" ")}
                                key={generateOptionId(opt, idx)}
                                onClick={(e) => onOptionSelected(e, opt)}
                            >
                                {opt.label}
                            </li>
                        ))}
                        {allowNewOptionsCreated && isValidNewOptionValue(inputValue) && (
                            <li
                                className="hover:bg-gray-200 px-2"
                                onClick={(e) => onNewOptionCreated(e, inputValue)}
                            >
                                Create new option "{inputValue}"...
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </>
    );
}
