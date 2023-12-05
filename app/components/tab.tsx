import classNames from "classnames";

export interface TabItem {
  id: string;
  icon: JSX.Element;
  title: string;
}

export default function Tab(p: {
  tab: TabItem;
  selectedTab?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={p.onClick}
      className={classNames(
        "hover:bg-gray-100 py-2 px-4 border-b-2 border-transparent cursor-pointer text-gray-600 flex items-center gap-x-1.5",
        {
          "text-primary  border-primary bg-gray-50": p.selectedTab === p.tab.id,
        }
      )}
      key={p.tab.id}
    >
      <div className="w-4">{p.tab.icon}</div>
      <div>{p.tab.title}</div>
    </div>
  );
}
