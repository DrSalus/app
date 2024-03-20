import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { range } from "lodash-es";
import React, { useMemo } from "react";
import { useLoaderData } from "@remix-run/react";
import { LinkButton } from "./button";

export interface PaginationProps {
	elements: any[];
	pageElementSize: number;
	currentPage: number;
	onPageChange: (page: number) => void;
}

export interface PaginationState {
	currentPage: number;
	numberOfPages: number;
}

export interface PaginatedResponse {
	pagination?: PaginationState;
}

const MAX_NUMBER_OF_PAGINATION_STEP = 5;
const PAGE_SIZE = 10;

function buildPageUrl(page: number, numberOfPages: number): string {
	if (typeof window === "undefined") {
		return "";
	} else {
		const nextPage = Math.min(Math.max(1, page), numberOfPages);
		const url = new URL(window.location.href);
		url.searchParams.set("page", nextPage.toString());
		return [url.pathname, url.search].join("");
	}
}

export type PaginationData = [{ take: number; skip: number }, PaginationState];

export async function getPaginationState(
	request: Request,
	count: Promise<number>,
	pageSize: number = PAGE_SIZE,
): Promise<PaginationData> {
	let currentPage = parseInt(
		new URL(request.url).searchParams.get("page") || "1",
	);
	const numberOfItems = await count;
	const numberOfPages = Math.ceil(numberOfItems / pageSize);
	if (currentPage > numberOfPages) {
		currentPage = numberOfPages;
	}

	const queryParams = {
		take: pageSize,
		skip: Math.max(0, currentPage - 1) * pageSize,
	};
	const paginationState = { currentPage, numberOfPages };
	return [queryParams, paginationState];
}

export default function Pagination(p: { primaryButton?: JSX.Element }) {
	const data = useLoaderData<PaginatedResponse>();

	const paginationRange = useMemo(() => {
		if (data.pagination == null) {
			return [];
		}
		const { currentPage, numberOfPages } = data.pagination;
		const pages = range(1, numberOfPages + 1);

		if (pages.length <= MAX_NUMBER_OF_PAGINATION_STEP) {
			return pages;
		}
		const delta = (MAX_NUMBER_OF_PAGINATION_STEP - 1) / 2;
		if (currentPage <= delta) {
			return pages.slice(0, MAX_NUMBER_OF_PAGINATION_STEP);
		}
		if (currentPage >= numberOfPages - delta) {
			return pages.slice(numberOfPages - MAX_NUMBER_OF_PAGINATION_STEP);
		}
		return pages.slice(currentPage - delta - 1, currentPage + delta);
	}, [data.pagination]);

	if (data.pagination == null) {
		return <React.Fragment />;
	}
	const { currentPage, numberOfPages } = data.pagination;

	return (
		<div className="pagination">
			<div className="fixed bottom-3 right-3">{p.primaryButton}</div>

			<LinkButton
				disabled={currentPage <= 1}
				icon={<ChevronLeftIcon />}
				to={buildPageUrl(currentPage - 1, numberOfPages)}
			/>
			{paginationRange.map((pageNumber: number, i) => (
				<LinkButton
					key={i}
					text={`${pageNumber}`}
					intent={pageNumber === currentPage ? "primary" : "none"}
					to={buildPageUrl(pageNumber, numberOfPages)}
				/>
			))}

			<LinkButton
				icon={<ChevronRightIcon />}
				disabled={currentPage >= numberOfPages}
				to={buildPageUrl(currentPage + 1, numberOfPages)}
			/>
		</div>
	);
}
