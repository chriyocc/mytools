import '../../styles/CommonCard.css'
import './JourneyCard.css'
import journeyIconMap from '../IconSelector/journeyIconMap';
import type { Database } from '../../types/database.types';
import { useImagePreview } from '../../components/ImagePreview/imagePreviewContext.tsx';
import { useMarkdownPreview } from '../MarkdownPreview/markdownPreviewContext.tsx';

type JourneyRow = Database['public']['Tables']['journey']['Row'];

interface JourneyCardState extends Partial<JourneyRow> {
  year?: number;
  month_name?: string;
  month_num?: number;
}

interface JourneyCardProps {
  journey: JourneyCardState;
  onEdit: (journey: JourneyCardState) => void;
  onDelete: (id: string, title: string) => void;
}

const JourneyCard: React.FC<JourneyCardProps> = ({ journey, onEdit, onDelete }) => {
  const { openImagePreview } = useImagePreview();
  const { openMarkdownPreview } = useMarkdownPreview();

  return (
    <div className="common-card">
      <div className='common-card-header'>
        <h2 className="common-card-title">{journey.title}</h2>
        <button onClick={() => onDelete((journey.id || ''), (journey.title || '') )} className="icon-btn delete">
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#cf0000ff">
            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
          </svg>
        </button>
      </div>
      {journey.action && (
        <strong className="common-card-info">
          {journey.action}
        </strong>
      )}
      {!journey.action && (
        <strong className="common-card-info">
          None
        </strong>
      )}
      <p className="common-card-info">{journey.month_name}&nbsp;{journey.year}</p>
      <p className="common-card-info">{journey.description}</p>
      {journey.type_icon1 && (
        <p className='common-card-info'>
          <strong>Icon 1:</strong>&nbsp;<span dangerouslySetInnerHTML={{ __html: journeyIconMap[journey.type_icon1] }} />
        </p>
      )}
      {journey.type_icon2 && (
        <p className='common-card-info'>
          <strong>Icon 1:</strong>&nbsp;<span dangerouslySetInnerHTML={{ __html: journeyIconMap[journey.type_icon2] }} />
        </p>
      )}
      <div className='journey-image-bar'>
        {journey.image_1 && (
          <img
            src={journey.image_1}
            alt={journey.title || ''}
            className="journey-image img-open"
            onClick={() => {
              openImagePreview(journey.image_1!);
            }}
          />
        )}
        {journey.image_2 && (
          <img
            src={journey.image_2}
            alt={journey.title || ''}
            className="journey-image img-open"
            onClick={() => {
              openImagePreview(journey.image_2!);
            }}
          />
        )}
        
      </div>
      {journey.image1_file && (
        <p className='common-card-fileInfo'>
          ✓ Image 1: {journey.image1_file} uploaded
        </p>
      )}
      {journey.image2_file && (
        <p className='common-card-fileInfo'>
          ✓ Image 2: {journey.image2_file} uploaded
        </p>
      )}
      {journey.markdown_content && (
        <p className='preview-open common-card-fileInfo' onClick={() => { openMarkdownPreview(journey.markdown_content!); }}>
          ✓ MarkdownContent: {journey.markdown_file} uploaded
        </p>
      )}
      <div className="common-card-bottomBar">
        <div className='common-card-dateWrapper'>
          <div className="db-date">
            Created at: {journey.created_at && new Date(journey.created_at).toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </div>
          <div className="db-date">
            Updated at: {journey.updated_at && new Date(journey.updated_at).toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </div>
        </div>
        <div className="common-card-actions">
        <button onClick={() => onEdit(journey)} className="btn btn-primary">
          Edit
        </button>
      </div>
      </div>
    </div>
  );
};

export default JourneyCard;
