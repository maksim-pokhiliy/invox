"use client";

import * as React from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { AppLayout } from "@app/components/layout/AppLayout";
import { Breadcrumbs } from "@app/components/navigation/Breadcrumbs";
import { Spinner } from "@app/components/feedback/Loading";
import { useToast } from "@app/components/feedback/Toast";
import {
  invoiceFormSchema,
  InvoiceFormInput,
  createClientSchema,
  CreateClientInput,
} from "@app/shared/schemas";
import { useClients, useCreateClient, useCreateInvoice, useTemplate, ApiError } from "@app/lib/api";
import { useAutosave } from "@app/hooks";

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
];

interface SortableItemProps {
  id: string;
  index: number;
  currency: string;
  canDelete: boolean;
  register: ReturnType<typeof useForm<InvoiceFormInput>>["register"];
  errors: ReturnType<typeof useForm<InvoiceFormInput>>["formState"]["errors"];
  onRemove: () => void;
}

function SortableItem({
  id,
  index,
  currency,
  canDelete,
  register,
  errors,
  onRemove,
}: SortableItemProps) {
  const theme = useTheme();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: "grid",
        gridTemplateColumns: "24px 2fr 100px 120px 40px",
        gap: 2,
        mb: 2,
        alignItems: "start",
        p: 1,
        borderRadius: 2,
        bgcolor: isDragging
          ? alpha(theme.palette.primary.main, 0.08)
          : alpha(theme.palette.primary.main, 0.02),
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 40,
          cursor: "grab",
          color: "text.secondary",
          "&:hover": { color: "primary.main" },
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>
      <TextField
        {...register(`items.${index}.description`)}
        placeholder="Item description"
        size="small"
        error={!!errors.items?.[index]?.description}
        helperText={errors.items?.[index]?.description?.message}
      />
      <TextField
        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
        type="number"
        size="small"
        inputProps={{ min: 1 }}
        error={!!errors.items?.[index]?.quantity}
      />
      <TextField
        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
        type="number"
        size="small"
        inputProps={{ min: 0, step: 0.01 }}
        InputProps={{
          startAdornment: (
            <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
              {currency}
            </Typography>
          ),
        }}
        error={!!errors.items?.[index]?.unitPrice}
      />
      <IconButton onClick={onRemove} disabled={!canDelete} color="error" size="small">
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

function getDefaultDueDate(): string {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
}

function getTemplateDueDate(dueDays: number): string {
  return new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
}

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const queryClient = useQueryClient();
  const theme = useTheme();
  const toast = useToast();
  const [error, setError] = React.useState<string | null>(null);
  const [clientDialogOpen, setClientDialogOpen] = React.useState(false);
  const [defaultDueDate] = React.useState(getDefaultDueDate);
  const [templateApplied, setTemplateApplied] = React.useState(false);

  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: template, isLoading: templateLoading } = useTemplate(templateId || "");

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<InvoiceFormInput>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: "",
      currency: "USD",
      dueDate: defaultDueDate,
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      notes: "",
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "items",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const createInvoiceMutation = useCreateInvoice();

  const formValues = watch();

  const { restoreDraft, clearDraft, lastSaved } = useAutosave({
    key: "invoice-draft-new",
    data: formValues,
    onRestore: (data) => {
      reset(data);
      toast.success("Draft restored");
    },
    enabled: isDirty,
  });

  const [showDraftBanner, setShowDraftBanner] = React.useState(false);

  React.useEffect(() => {
    if (template && !templateApplied && !templateLoading) {
      const templateDueDate = getTemplateDueDate(template.dueDays);
      reset({
        clientId: "",
        currency: template.currency,
        dueDate: templateDueDate,
        items: template.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice / 100,
        })),
        notes: template.notes || "",
      });
      setTemplateApplied(true);
      toast.success(`Template "${template.name}" applied`);
    }
  }, [template, templateApplied, templateLoading, reset, toast]);

  React.useEffect(() => {
    const checkDraft = () => {
      try {
        const saved = localStorage.getItem("invoice-draft-new");
        if (saved) {
          setShowDraftBanner(true);
        }
      } catch {}
    };
    checkDraft();
  }, []);

  const handleRestoreDraft = () => {
    restoreDraft();
    setShowDraftBanner(false);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftBanner(false);
  };

  const onSubmit = (data: InvoiceFormInput) => {
    setError(null);
    const transformedData = {
      clientId: data.clientId,
      currency: data.currency,
      dueDate: new Date(data.dueDate),
      items: data.items.map((item) => ({
        ...item,
        unitPrice: Math.round(item.unitPrice * 100),
      })),
      notes: data.notes || undefined,
    };
    createInvoiceMutation.mutate(transformedData, {
      onSuccess: (invoice) => {
        clearDraft();
        toast.success("Invoice created successfully!");
        router.push(`/app/invoices/${invoice.id}`);
      },
      onError: (err) => {
        const message = err instanceof ApiError ? err.message : "Failed to create invoice";
        setError(message);
        toast.error(message);
      },
    });
  };

  const items = useWatch({ control, name: "items" });
  const currency = useWatch({ control, name: "currency" });

  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  return (
    <AppLayout>
      <Breadcrumbs
        items={[{ label: "Invoices", href: "/app/invoices" }, { label: "New Invoice" }]}
      />

      {showDraftBanner && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" color="inherit" onClick={handleDiscardDraft}>
                Discard
              </Button>
              <Button size="small" variant="contained" onClick={handleRestoreDraft}>
                Restore
              </Button>
            </Box>
          }
        >
          You have an unsaved draft. Would you like to restore it?
        </Alert>
      )}

      {lastSaved && isDirty && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 2, textAlign: "right" }}
        >
          Draft saved {lastSaved.toLocaleTimeString()}
        </Typography>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Create Invoice
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Fill in the details below to create a new invoice
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Invoice Details
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
              gap: 3,
              mb: 4,
            }}
          >
            <FormControl fullWidth error={!!errors.clientId}>
              <InputLabel id="client-label">Client</InputLabel>
              <Select
                {...register("clientId")}
                labelId="client-label"
                label="Client"
                disabled={clientsLoading}
              >
                {clients?.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.clientId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.clientId.message}
                </Typography>
              )}
              <Button
                size="small"
                onClick={() => setClientDialogOpen(true)}
                sx={{ mt: 1, alignSelf: "flex-start" }}
              >
                + Add New Client
              </Button>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="currency-label">Currency</InputLabel>
              <Select
                {...register("currency")}
                labelId="currency-label"
                label="Currency"
                defaultValue="USD"
              >
                {currencies.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Due Date"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.format("YYYY-MM-DD") || "")}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.dueDate,
                      helperText: errors.dueDate?.message,
                    },
                  }}
                />
              )}
            />
          </Box>

          <TextField
            {...register("notes")}
            label="Internal Notes"
            placeholder="Add notes for yourself (not visible to client)"
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 3 }}
            helperText="These notes are for your reference only and won't be shown on the invoice"
          />

          <Divider sx={{ my: 4 }} />

          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Line Items
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "24px 2fr 100px 120px 40px",
              gap: 2,
              mb: 1,
              px: 1,
            }}
          >
            <Box />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Description
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Quantity
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Unit Price
            </Typography>
            <Box />
          </Box>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {fields.map((field, index) => (
                <SortableItem
                  key={field.id}
                  id={field.id}
                  index={index}
                  currency={currency}
                  canDelete={fields.length > 1}
                  register={register}
                  errors={errors}
                  onRemove={() => remove(index)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <Button
            startIcon={<AddIcon />}
            onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
            sx={{ mb: 4 }}
          >
            Add Line Item
          </Button>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
            <Box
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderRadius: 2,
                minWidth: 250,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography variant="body2">
                  {currency} {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Total
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                  {currency} {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={() => router.push("/app/invoices")}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createInvoiceMutation.isPending}
              sx={{ minWidth: 150 }}
            >
              {createInvoiceMutation.isPending ? <Spinner size={20} /> : "Create Invoice"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <AddClientDialog
        open={clientDialogOpen}
        onClose={() => setClientDialogOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["clients"] });
          setClientDialogOpen(false);
          toast.success("Client added successfully!");
        }}
      />
    </AppLayout>
  );
}

function AddClientDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
  });

  const createClientMutation = useCreateClient();

  const onSubmit = (data: CreateClientInput) => {
    setError(null);
    createClientMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onSuccess();
      },
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : "Failed to create client");
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Add New Client</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            {...register("name")}
            label="Client Name"
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            {...register("email")}
            label="Client Email"
            type="email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={createClientMutation.isPending}>
            {createClientMutation.isPending ? <Spinner size={20} /> : "Add Client"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
