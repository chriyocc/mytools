import type { Journey } from '../../types/Journey';
import './JourneyCard.css';

interface JourneyCardProps {
  journey: Journey & { id: number };
  onEdit: (journey: Journey & { id: number }) => void;
  onDelete: (id: number) => void;
}

const JourneyCard = ({ journey, onEdit, onDelete }: JourneyCardProps) => {
  const formattedDate = new Date(journey.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="journey-card">
      <div className='journey-card-header'>
        <h2 className="journey-title">{journey.title}</h2>
        <button onClick={() => onDelete(journey.id)} className="btn-delete">
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#cf0000ff">
            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
          </svg>
        </button>
      </div>
      <p className="journey-date">{formattedDate}</p>
      <p className="journey-description">{journey.description}</p>
      {journey.image && (
        <img 
          src={journey.image} 
          alt={journey.title}
          className="journey-image"
        />
      )}
      <div className="journey-actions">
        <button onClick={() => onEdit(journey)} className="btn btn-primary">
          Edit
        </button>
      </div>
    </div>
  );
};

export default JourneyCard;
