"use client";

import * as React from "react";

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

import { formatCurrency } from "@app/shared/lib/format";

interface InvoiceItem {
  id: string;
  title: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceItemGroup {
  id: string;
  title: string;
  items: InvoiceItem[];
}

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  itemGroups?: InvoiceItemGroup[];
  currency: string;
  size?: "small" | "medium";
}

export function InvoiceItemsTable({ items, itemGroups, currency, size }: InvoiceItemsTableProps) {
  return (
    <TableContainer>
      <Table size={size}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, border: 0 }}>Item</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, border: 0, whiteSpace: "nowrap" }}>
              Qty
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, border: 0, whiteSpace: "nowrap" }}>
              Unit Price
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, border: 0, whiteSpace: "nowrap" }}>
              Amount
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itemGroups?.map((group) => {
            const groupTotal = group.items.reduce((sum, item) => sum + item.amount, 0);

            return (
              <React.Fragment key={group.id}>
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 600, bgcolor: "action.hover", py: 1 }}>
                    {group.title}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 600, bgcolor: "action.hover", py: 1, whiteSpace: "nowrap" }}
                  >
                    {formatCurrency(groupTotal, currency)}
                  </TableCell>
                </TableRow>
                {group.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ pl: 4, borderBottom: 0 }}>{item.title}</TableCell>
                    <TableCell align="right" sx={{ borderBottom: 0 }}>
                      {item.quantity}
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: 0, whiteSpace: "nowrap" }}>
                      {formatCurrency(item.unitPrice, currency)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 500, borderBottom: 0, whiteSpace: "nowrap" }}
                    >
                      {formatCurrency(item.amount, currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            );
          })}
          {items.map((item) => (
            <TableRow key={item.id} sx={{ "&:last-child td": { border: 0 } }}>
              <TableCell>{item.title}</TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                {formatCurrency(item.unitPrice, currency)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                {formatCurrency(item.amount, currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
