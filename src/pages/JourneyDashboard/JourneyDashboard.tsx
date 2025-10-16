import { useState } from 'react';
import type { Journey } from '../../types/Journey';
import Modal from '../../components/Modal/Modal';
import JourneyCard from '../../components/JourneyCard/JourneyCard';
import JourneyForm from '../../components/JourneyForm/JourneyForm';
import './JourneyDashboard.css';

const JourneyDashboard = () => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [journeys, setJourneys] = useState<(Journey & { id: number })[]>([
    { 
      id: 1, 
      title: 'Started Learning React', 
      description: 'Began my journey with React.js', 
      date: '2025-01-15'
    },
    { 
      id: 2, 
      title: 'First Project Launch', 
      description: 'Launched my first full-stack application', 
      date: '2025-03-20'
    },
  ]);

  const [formData, setFormData] = useState<Journey>({
    title: '',
    description: '',
    date: '',
    markdown: '',
    image: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (type: 'markdown' | 'image') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFormData({ ...formData, [type]: content });
    };

    if (type === 'markdown') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!formData.date) {
      alert('Please select a date');
      return;
    }

    if (formData.id !== undefined) {
      setJourneys(journeys.map((j) => (j.id === formData.id ? { ...formData, id: j.id } : j)));
    } else {
      setJourneys([...journeys, { ...formData, id: Date.now() }]);
    }
    setFormData({ title: '', description: '', date: '', markdown: '', image: '' });
    setIsModalOpen(false);
  };

  const handleEdit = (journey: Journey & { id: number }) => {
    setFormData(journey);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const journey = journeys.find(j => j.id === id);
    if (!journey) return;

    if (window.confirm(`Are you sure you want to delete "${journey.title}"?`)) {
      setJourneys(journeys.filter((j) => j.id !== id));
    }
  };

  const handleAddNew = () => {
    setFormData({ title: '', description: '', date: '', markdown: '', image: '' });
    setIsModalOpen(true);
  };

  // Filter journeys based on selected year
  const filteredJourneys = selectedYear === 'all' 
    ? journeys 
    : journeys.filter(journey => new Date(journey.date).getFullYear() === selectedYear);

  // Group and sort the filtered journeys
  const sortedGroups = Object.entries(
    filteredJourneys.reduce((groups, journey) => {
      const date = new Date(journey.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const key = `${year}-${month}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(journey);
      return groups;
    }, {} as Record<string, typeof journeys>)
  ).sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="journey-dashboard">
      <div className="dashboard-header">
        <h1>Journey Dashboard</h1>
        <button className="btn btn-primary" onClick={handleAddNew}>
          Add Journey Entry
        </button>
      </div>
      <div className="year-selector">
        <button 
          className={`btn year-btn ${selectedYear === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedYear('all')}
        >
          All Years
        </button>
        {[2024, 2025, 2026].map(year => (
          <button
            key={year}
            className={`btn year-btn ${selectedYear === year ? 'active' : ''}`}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={formData.id !== undefined ? 'Edit Journey Entry' : 'Add Journey Entry'}
      >
        <JourneyForm
          formData={formData}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onFileUpload={handleFileUpload}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <div className="journey-timeline">
        {filteredJourneys.length === 0 ? (
          <div className="empty-state">
            <h2>No Journey Entries {selectedYear !== 'all' ? `for ${selectedYear}` : ''}</h2>
            <p>
              {selectedYear === 'all' 
                ? 'Start documenting your journey by adding your first entry!'
                : `No entries found for ${selectedYear}. Try selecting a different year or add a new entry.`}
            </p>
            <button className="btn btn-primary" onClick={handleAddNew}>
              Add Your First Entry
            </button>
          </div>
        ) : (
          sortedGroups.map(([dateKey, groupJourneys]) => {
            const [year, month] = dateKey.split('-');
            const date = new Date(Number(year), Number(month));
            return (
              <div key={dateKey} className="timeline-group">
                <h2 className="timeline-header">
                  {date.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="journey-group">
                  {groupJourneys.map((journey) => (
                    <JourneyCard
                      key={journey.id}
                      journey={journey}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default JourneyDashboard;
