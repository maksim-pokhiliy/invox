"use client";

import * as React from "react";

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

import { formatCurrency } from "@app/shared/lib/format";

interface InvoiceItem {
  id: string;
  description: string;
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
            <TableCell sx={{ fontWeight: 600, border: 0 }}>Description</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, border: 0 }}>
              Qty
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, border: 0 }}>
              Unit Price
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, border: 0 }}>
              Amount
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itemGroups?.map((group) => (
            <React.Fragment key={group.id}>
              <TableRow>
                <TableCell colSpan={4} sx={{ fontWeight: 600, bgcolor: "action.hover", py: 1 }}>
                  {group.title}
                </TableCell>
              </TableRow>
              {group.items.map((item) => (
                <TableRow key={item.id} sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell sx={{ pl: 4 }}>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.unitPrice, currency)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {formatCurrency(item.amount, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
          {items.map((item) => (
            <TableRow key={item.id} sx={{ "&:last-child td": { border: 0 } }}>
              <TableCell>{item.description}</TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right">{formatCurrency(item.unitPrice, currency)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 500 }}>
                {formatCurrency(item.amount, currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
