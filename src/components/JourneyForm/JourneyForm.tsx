import type { Journey } from '../../types/Journey';
import './JourneyForm.css';

interface JourneyFormProps {
  formData: Journey;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFileUpload: (type: 'markdown' | 'image') => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
}

const JourneyForm = ({ formData, onSubmit, onChange, onFileUpload, onCancel }: JourneyFormProps) => {
  return (
    <form onSubmit={onSubmit} className="journey-form">
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          placeholder="Enter journey title"
          value={formData.title}
          onChange={onChange}
          className="form-control"
          required
        />
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          name="date"
          value={formData.date}
          onChange={onChange}
          className="form-control"
          required
        />
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter journey description"
          value={formData.description}
          onChange={onChange}
          className="form-control"
          required
        />
        <div className='upload-section'>
          <input
            type="file"
            accept="image/*"
            onChange={onFileUpload('image')}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="btn btn-secondary">
            {formData.image ? 'Change Image' : 'Upload Image'}
          </label>
          {formData.image && <span className="file-name">✓ Image uploaded</span>}
        </div>
      </div>
      <div className="journey-actions">
        <button type="submit" className="btn btn-primary">
          {formData.id !== undefined ? 'Update' : 'Add'} Entry
        </button>
        <button type="button" className="btn btn-danger" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default JourneyForm;
