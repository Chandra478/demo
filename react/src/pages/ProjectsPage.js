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
  TableSortLabel
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const params = {
          sort: orderBy,
          status: statusFilter === 'all' ? null : statusFilter,
        };
        const data = await projectService.getAll(params);
        setProjects(data.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [orderBy, order, statusFilter]);

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
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
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
      await projectService.bulkAction(action, selected);
      const data = await projectService.getAll({
        sort: orderBy,
        status: statusFilter === 'all' ? null : statusFilter,
      });
      setProjects(data.data);
      setSelected([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setActionLoading(false);
    }
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
                onClick={() => handleBulkAction('reject')}
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
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'created_at'}
                    direction={orderBy === 'created_at' ? order : 'asc'}
                    onClick={() => handleRequestSort('created_at')}
                  >
                    Submitted
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((project) => {
                  const isItemSelected = isSelected(project.id);
                  return (
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
                          label={project.status}
                          color={statusColors[project.status]}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(project.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          href={`/projects/${project.id}`}
                        >
                          View
                        </Button>
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
          count={projects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}

export default ProjectsPage;