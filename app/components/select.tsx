import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import classNames from "classnames";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useFetcher } from "@remix-run/react";
import Button from "./button";
import { isString } from "lodash-es";

type Props<T> = {
  className?: string;
  placeholder?: string;
  options?: T[];
  name: string;
  minimal?: boolean;
  defaultValue?: T;
  searchAction?: string;
  valueGetter?: (val: T) => string;
  renderDisplayName?: (val: T) => string;
};

type SelectOption = { label: string; value: string };
export function Select(props: Props<SelectOption>) {
  return (
    <RemoteSelect<SelectOption>
      {...props}
      options={props.options}
      valueGetter={(t) => (isString(t) ? t : t.value)}
      renderDisplayName={(t) => (isString(t) ? t : t.label)}
    />
  );
}

export function RemoteSelect<T>(props: Props<T>) {
  const {
    renderDisplayName,
    defaultValue,
    className,
    options,
    valueGetter,
    searchAction,
  } = props;

  const fetcher = useFetcher<T[]>();
  const ref = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [value, setValue] = useState<T | null>(defaultValue ?? null);
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    if (defaultValue != null) {
      setValue(defaultValue);
      setQuery(renderDisplayName?.(defaultValue) ?? String(defaultValue));
    }
  }, [defaultValue]);

  const items: T[] = (options ?? fetcher.data ?? []) as T[];
  const hasValue = value != null;
  const isOpen = focus && items.length > 0;

  useEffect(() => {
    if (searchAction != null) {
      fetcher.submit({ query }, { method: "post", action: searchAction });
    }
  }, [query, searchAction]);

  const handleChange = useCallback(
    (u: T) => {
      inputRef.current?.blur();
      setValue(u);
      setQuery(renderDisplayName?.(u) ?? String(u));
    },
    [renderDisplayName]
  );

  const handleReset = useCallback(() => {
    inputRef.current?.blur();
    setValue(null);
    setQuery("");
  }, []);

  return (
    <div
      className={classNames("flex flex-col items-stretch relative", className)}
    >
      <input
        type="hidden"
        name={props.name}
        value={value != null ? valueGetter?.(value) ?? String(value) : ""}
      />
      <div className="flex flex-col ">
        <fetcher.Form
          ref={ref}
          method="post"
          action="/users/search"
          className={classNames("bg-white p-1 flex border border-gray-200", {
            rounded: !isOpen,
            "rounded-t": isOpen,
            "border-none": props.minimal,
          })}
        >
          <div className="flex flex-auto flex-wrap bg-blue-400"></div>
          <input
            ref={inputRef}
            type="text"
            placeholder={props.placeholder}
            name="query"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            className="p-1 px-2 appearance-none outline-none w-full text-gray-800 "
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />

          {hasValue && (
            <>
              <Button
                className="mr-1"
                minimal={true}
                icon={<XMarkIcon />}
                onClick={handleReset}
              />
            </>
          )}

          <div className="text-gray-300 w-8 py-1 pl-2 pr-1 border-l flex items-center border-gray-200">
            <button
              onClick={(e) => {
                e.preventDefault();
                inputRef?.current?.focus();
              }}
              className="cursor-pointer w-6 h-6 text-gray-600 outline-none focus:outline-none"
            >
              {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          </div>
        </fetcher.Form>
      </div>
      <SuggestionList
        isOpen={isOpen}
        items={props.options ?? items}
        onChange={handleChange}
        renderDisplayName={renderDisplayName}
      />
    </div>
  );
}

function SuggestionList<T>(p: {
  items: T[];
  isOpen?: boolean;
  renderDisplayName?: (item: T) => string;
  onChange: (value: T) => void;
}) {
  return p.isOpen ? (
    <div className="absolute top-full z-50 left-0 right-0 shadow-lg rounded-b border-gray-200 border border-t-0 overflow-scroll h-52">
      {p.items.map((item: T, index: number) => {
        return (
          <div
            key={index}
            className="cursor-pointer w-full border-gray-100 bg-blue-200 rounded-t 
hover:bg-sky-100 "
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              p.onChange(item);
            }}
          >
            <div className="flex w-full items-center p-2 pl-2 border-transparent bg-white border-l-4 relative  hover:bg-sky-800 hover:text-white hover:border-sky-500">
              <div className="w-full items-center flex">
                <div className="mx-2 leading-6">
                  {p.renderDisplayName?.(item) ?? String(item)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <React.Fragment />
  );
}
