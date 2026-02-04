"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  alpha,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { AppLayout } from "@app/components/layout/AppLayout";
import { Breadcrumbs } from "@app/components/navigation/Breadcrumbs";
import { TableSkeleton, Spinner } from "@app/components/feedback/Loading";
import { useToast } from "@app/components/feedback/Toast";
import { ConfirmDialog, useConfirmDialog } from "@app/components/feedback/ConfirmDialog";
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  ApiError,
} from "@app/lib/api";
import { createClientSchema, CreateClientInput } from "@app/shared/schemas";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default function ClientsPage() {
  const theme = useTheme();
  const toast = useToast();
  const { confirm, dialogProps } = useConfirmDialog();

  const { data: clients, isLoading, error } = useClients();
  const deleteMutation = useDeleteClient();

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  const selectedClient = clients?.find((c) => c.id === selectedClientId);

  // Filter clients
  const filteredClients = React.useMemo(() => {
    if (!clients) return [];
    return clients.filter((client) => {
      return (
        searchQuery === "" ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [clients, searchQuery]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, clientId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedClientId(clientId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedClientId(null);
  };

  const handleDelete = () => {
    if (!selectedClient) return;
    handleMenuClose();
    confirm({
      title: "Delete Client",
      message: `Are you sure you want to delete "${selectedClient.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      confirmColor: "error",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(selectedClient.id);
        toast.success("Client deleted successfully");
      },
    });
  };

  const handleEdit = () => {
    handleMenuClose();
    setEditDialogOpen(true);
  };

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Clients" }]} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Clients
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your clients and contacts
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
          Add Client
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load clients. Please try again.
        </Alert>
      )}

      {/* Search */}
      {!isLoading && clients && clients.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search clients..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: { sm: 280 } }}
            inputProps={{ "aria-label": "Search clients" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {searchQuery && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {filteredClients.length} of {clients.length} clients
            </Typography>
          )}
        </Box>
      )}

      {isLoading ? (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <TableSkeleton rows={5} columns={4} />
        </Paper>
      ) : clients && clients.length > 0 && filteredClients.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            "& .MuiTableHead-root": {
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  hover
                  sx={{
                    transition: "background-color 0.2s",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {client.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {client.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(client.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, client.id)}
                      sx={{ color: "text.secondary" }}
                      aria-label={`Actions for ${client.name}`}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : clients && clients.length > 0 && filteredClients.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <SearchIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            No clients found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search to find what you&apos;re looking for.
          </Typography>
          <Button variant="outlined" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <PeopleIcon sx={{ fontSize: 40, color: "primary.main" }} />
          </Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            No clients yet
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
          >
            Add your first client to start creating invoices. Clients help you organize your billing
            and keep track of who you&apos;re working with.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add Your First Client
          </Button>
        </Paper>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: { minWidth: 140, borderRadius: 2 },
          },
        }}
        aria-label="Client actions"
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog {...dialogProps} />

      {/* Create Client Dialog */}
      <ClientDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        mode="create"
      />

      {/* Edit Client Dialog */}
      {selectedClient && (
        <ClientDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedClientId(null);
          }}
          mode="edit"
          client={selectedClient}
        />
      )}
    </AppLayout>
  );
}

function ClientDialog({
  open,
  onClose,
  mode,
  client,
}: {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  client?: { id: string; name: string; email: string };
}) {
  const toast = useToast();
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: client?.name || "",
        email: client?.email || "",
      });
      setError(null);
    }
  }, [open, client, reset]);

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const onSubmit = (data: CreateClientInput) => {
    setError(null);
    if (mode === "create") {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Client created successfully!");
          reset();
          onClose();
        },
        onError: (err) => {
          setError(err instanceof ApiError ? err.message : "Failed to create client");
        },
      });
    } else if (client) {
      updateMutation.mutate(
        { id: client.id, data },
        {
          onSuccess: () => {
            toast.success("Client updated successfully!");
            onClose();
          },
          onError: (err) => {
            setError(err instanceof ApiError ? err.message : "Failed to update client");
          },
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {mode === "create" ? "Add New Client" : "Edit Client"}
      </DialogTitle>
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
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? <Spinner size={20} /> : mode === "create" ? "Add Client" : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
