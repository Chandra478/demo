import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  TablePagination,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import projectService from '../api/project';

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('created_at');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [totalProjects, setTotalProjects] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const params = {
          sort: orderBy,
          status: statusFilter === 'all' ? null : statusFilter,
          page: page + 1,
          per_page: rowsPerPage,
        };
        const data = await projectService.getAll(params);
        setProjects(data.data);
        setTotalProjects(data.meta.total);
        setRowsPerPage(data.meta.per_page);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [orderBy, order, statusFilter, page, rowsPerPage]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const params = {
          sort: orderBy,
          status: statusFilter === 'all' ? null : statusFilter,
          page: page + 1,
          per_page: rowsPerPage,
        };
        const data = await projectService.getAll(params);
        setProjects(data.data);
        setTotalProjects(data.meta.total);
        setRowsPerPage(data.meta.per_page);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    if (page > 0) {
      fetchProjects();
    }
  }, [page]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = projects.map((project) => project.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((item) => item !== id);
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleBulkAction = async (action) => {
    try {
      setActionLoading(true);
      if (action === 'reject') {
        if (rejectionReason.trim() === '') {
          alert('Please provide a rejection reason');
          return;
        }
        await projectService.bulkAction(action, selected, rejectionReason);
      } else {
        await projectService.bulkAction(action, selected);
      }
      const data = await projectService.getAll({
        sort: orderBy,
        status: statusFilter === 'all' ? null : statusFilter,
        page: page + 1,
        per_page: rowsPerPage,
      });
      setProjects(data.data);
      setTotalProjects(data.meta.total);
      setSelected([]);
      setOpenRejectDialog(false);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectDialog = () => {
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
  };

  const handleRejectionReasonChange = (event) => {
    setRejectionReason(event.target.value);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - projects.length) : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          {user?.role === 'admin' && selected.length > 0 && (
            <Box>
              <Button
                variant="contained"
                color="success"
                sx={{ mr: 2 }}
                onClick={() => handleBulkAction('approve')}
                disabled={actionLoading}
              >
                {actionLoading ? <CircularProgress size={24} /> : 'Approve Selected'}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleOpenRejectDialog}
                disabled={actionLoading}
              >
                {actionLoading ? <CircularProgress size={24} /> : 'Reject Selected'}
              </Button>
            </Box>
          )}
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {user?.role === 'admin' && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selected.length > 0 && selected.length < projects.length
                      }
                      checked={
                        projects.length > 0 && selected.length === projects.length
                      }
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'title'}
                    direction={orderBy === 'title' ? order : 'asc'}
                    onClick={() => handleRequestSort('title')}
                  >
                    Title
                  </TableSortLabel>
                </TableCell>
                <TableCell>Description</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={orderBy === 'file_path'}
                    direction={orderBy === 'file_path' ? order : 'asc'}
                    onClick={() => handleRequestSort('file_path')}
                  >
                    Image
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'created_at'}
                    direction={orderBy === 'created_at' ? order : 'asc'}
                    onClick={() => handleRequestSort('created_at')}
                  >
                    Submitted
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'updated_at'}
                    direction={orderBy === 'updated_at' ? order : 'asc'}
                    onClick={() => handleRequestSort('updated_at')}
                  >
                    Updated
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project, index) => {
                const isItemSelected = isSelected(project.id);
                const row = index >= page * rowsPerPage && index < (page + 1) * rowsPerPage;
                return row && (
                  <TableRow
                    hover
                    key={project.id}
                    selected={isItemSelected}
                    onClick={(event) => user?.role === 'admin' && handleClick(event, project.id)}
                    sx={{ cursor: user?.role === 'admin' ? 'pointer' : 'default' }}
                  >
                    {user?.role === 'admin' && (
   <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                        />
                      </TableCell>
                    )}
                    <TableCell>{project.title}</TableCell>
                    <TableCell>
                      {project.description.length > 50
                        ? `${project.description.substring(0, 50)}...`
                        : project.description}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        color={statusColors[project.status]}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <img
                        src={'http://localhost:8000/project_files/'+project.file_url}
                        alt={project.title}
                        width={40}
                        height={40}
                      />
                    </TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(project.created_at))}
                    </TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(project.updated_at))}
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalProjects}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <Dialog
        open={openRejectDialog}
        onClose={handleCloseRejectDialog}
        aria-labelledby="reject-dialog-title"
        aria-describedby="reject-dialog-description"
      >
        <DialogTitle id="reject-dialog-title">Reject Selected Projects</DialogTitle>
        <DialogContent>
          <DialogContentText id="reject-dialog-description">
            Are you sure you want to reject the selected projects? Please enter the reason for rejection.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="rejection-reason"
            label="Reason"
            type="text"
            fullWidth
            variant="standard"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog}>Cancel</Button>
          <Button onClick={() => handleBulkAction('reject')} disabled={rejectionReason.trim() === ''}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectsPage;

