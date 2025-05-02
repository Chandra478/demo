import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert, 
  Chip,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import projectService from '../api/project';

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await projectService.get(id);
        setProject(data);
      } catch (err) {
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await projectService.approve(id);
      navigate('/projects');
    } catch (err) {
      setError(err.message || 'Failed to approve project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await projectService.reject(id, rejectionReason);
      navigate('/projects');
    } catch (err) {
      setError(err.message || 'Failed to reject project');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box>
        <Typography variant="h4">Project not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{project.title}</Typography>
        <Chip
          label={project.status}
          color={statusColors[project.status]}
          size="medium"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Project Details
        </Typography>
        <Typography variant="body1" paragraph>
          {project.description}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href={project.file_url}
          target="_blank"
          sx={{ mt: 2 }}
        >
          Download File
        </Button>
      </Paper>

      {project.status === 'rejected' && project.rejection_reason && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'error.light' }}>
          <Typography variant="h6" gutterBottom>
            Rejection Reason
          </Typography>
          <Typography variant="body1">{project.rejection_reason}</Typography>
        </Paper>
      )}

      {project.approval_logs && project.approval_logs.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Approval History
          </Typography>
          <List>
            {project.approval_logs.map((log, index) => (
              <div key={log.id}>
                <ListItem>
                  <ListItemText
                    primary={`${log.action.toUpperCase()} by ${log.user?.name || 'System'}`}
                    secondary={`${new Date(log.created_at).toLocaleString()} - ${log.reason || 'No reason provided'}`}
                  />
                </ListItem>
                {index < project.approval_logs.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        </Paper>
      )}

      {user?.role === 'admin' && project.status === 'pending' && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Admin Actions
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="contained"
              color="success"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} /> : 'Approve'}
            </Button>
            <Box flexGrow={1}>
              <TextField
                fullWidth
                label="Rejection Reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </Box>
            <Button
              variant="contained"
              color="error"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason}
            >
              {actionLoading ? <CircularProgress size={24} /> : 'Reject'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default ProjectDetailPage;