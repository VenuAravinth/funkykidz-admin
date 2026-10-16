"use client";

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { Pagination } from "@/components/molecules/Pagination";
import { usePagination } from "@/lib/usePagination";
import { cn } from "@/lib/cn";

const TableContext = createContext<{ slot: HTMLElement | null; paginate: boolean }>({ slot: null, paginate: false });

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  stickyActions?: boolean;
  paginate?: boolean;
}

const stickyLastColumn = [
  "[&_tr>*:last-child:not([colspan])]:sticky",
  "[&_tr>*:last-child:not([colspan])]:right-0",
  "[&_tr>*:last-child:not([colspan])]:w-px",
  "[&_tr>*:last-child:not([colspan])]:whitespace-nowrap",
  "[&_tr>*:last-child:not([colspan])]:pl-3",
  "[&_tr>*:last-child:not([colspan])]:pr-4",
  "[&_tr>*:last-child:not([colspan])]:bg-cream-50/95",
  "[&_tr>*:last-child:not([colspan])]:backdrop-blur-sm",
].join(" ");

export function Table({ className, stickyActions = false, paginate = true, ...props }: TableProps) {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  return (
    <TableContext.Provider value={{ slot, paginate }}>
      <div data-paginated={paginate || undefined} className="w-full scroll-mt-24">
        <div className="w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-glass-border bg-glass shadow-[0_8px_30px_-16px_rgba(43,36,29,0.18)] backdrop-blur-sm">
          <table className={cn("w-full min-w-max border-collapse text-sm", stickyActions && stickyLastColumn, className)} {...props} />
        </div>
        {paginate && <div ref={setSlot} />}
      </div>
    </TableContext.Provider>
  );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("border-b border-glass-border bg-white/60", className)} {...props} />;
}

function isPinnedRow(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;
  const props = node.props as { colSpan?: number; children?: ReactNode; summary?: boolean };
  return props.summary === true || (props.colSpan !== undefined && props.children === undefined);
}

export function TableBody({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  const { slot, paginate } = useContext(TableContext);
  const items = Children.toArray(children);
  const rows = items.filter((node) => !isPinnedRow(node));
  const pinned = items.filter(isPinnedRow);
  const pagination = usePagination(rows.map((node, i) => (isValidElement(node) ? String(node.key ?? i) : String(i))));
  const visible = paginate ? rows.slice(pagination.start, pagination.end) : rows;

  return (
    <>
      <tbody className={cn("divide-y divide-glass-border", className)} {...props}>
        {visible}
        {pinned}
      </tbody>
      {paginate && slot && createPortal(<Pagination state={pagination} />, slot)}
    </>
  );
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  summary?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TableRow({ className, summary, ...props }: TableRowProps) {
  return <tr className={cn("transition-colors hover:bg-white/40", className)} {...props} />;
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted", className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("whitespace-nowrap px-5 py-4 align-middle text-sm text-ink", className)} {...props} />;
}

export function TableEmpty({ colSpan, message = "No records found." }: { colSpan: number; message?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-16 text-center text-sm text-ink-muted">
        {message}
      </td>
    </tr>
  );
}
