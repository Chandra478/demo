import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import projectService from '../api/project';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required').max(255),
  description: Yup.string().required('Description is required'),
  file: Yup.mixed().required('File is required'),
});

function ProjectSubmitPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      file: null,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        await projectService.create(values);
        navigate('/projects');
      } catch (err) {
        setError(err.message || 'Failed to submit project');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleFileChange = (event) => {
    formik.setFieldValue('file', event.currentTarget.files[0]);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Submit New Project
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            id="title"
            name="title"
            label="Project Title"
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
          />
          <TextField
            fullWidth
            margin="normal"
            id="description"
            name="description"
            label="Project Description"
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
          <Box sx={{ mt: 2, mb: 3 }}>
            <input
              accept="*"
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload">
              <Button variant="contained" component="span">
                Upload File
              </Button>
            </label>
            {formik.values.file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {formik.values.file.name}
              </Typography>
            )}
            {formik.touched.file && formik.errors.file && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {formik.errors.file}
              </Typography>
            )}
          </Box>
          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Project'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default ProjectSubmitPage;