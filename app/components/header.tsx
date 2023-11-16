import React from "react";
import Show from "./show";
import { isEmpty } from "lodash-es";
import classNames from "classnames";
import { Form, Outlet } from "@remix-run/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

interface Tab {
  icon: JSX.Element;
  id: string;
  title: string;
}

export interface HeaderProps {
  image?: string;
  title: string | JSX.Element;
  description?: string | JSX.Element;
  tags?: string[];
  tabs?: Tab[];
  actions?: JSX.Element | JSX.Element[];
  onSelectTab?: (tab: string) => void;
  selectedTab?: string | null;
}

export default function Header(p: HeaderProps) {
  return (
    <div className="flex flex-col px-4 py-2 border-b bg-white">
      <div className="flex flex-row items-center py-2">
        {p.image != null ? (
          <img className="h-32 rounded-l-lg" src={p.image} />
        ) : (
          <React.Fragment />
        )}
        <div className="flex flex-grow flex-col items-start px-4">
          <h3 className="text-3xl mb-1 mt-2">{p.title}</h3>
          {p.description != null && (
            <p className="text-sm text-gray-500 mb-2">{p.description}</p>
          )}
          <div className="flex">
            {p.tags?.map((d, i) => (
              <div key={i} className="tag small mr-1">
                {d}
              </div>
            ))}
          </div>
        </div>
        <div className=" py-3 self-end">{p.actions}</div>
      </div>
      <Show if={p.tabs != null}>
        <div className="flex flex-col border-t border-gray-100 -mx-4 px-6 -mb-2">
          <div className="flex  items-stretch text-sm font-semibold">
            {(p.tabs ?? []).map((tab) => (
              <div
                onClick={() => p.onSelectTab?.(tab.id)}
                className={classNames(
                  "hover:bg-gray-100 py-2 px-4 border-b-2 border-transparent cursor-pointer text-gray-600 flex items-center gap-x-1.5",
                  {
                    "text-primary  border-primary bg-gray-50":
                      p.selectedTab === tab.id,
                  }
                )}
                key={tab.id}
              >
                <div className="w-4">{tab.icon}</div>
                <div>{tab.title}</div>
              </div>
            ))}
          </div>
        </div>
      </Show>
    </div>
  );
}
