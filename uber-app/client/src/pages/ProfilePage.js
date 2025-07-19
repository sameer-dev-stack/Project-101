import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, User, Mail, Phone, MapPin, Star, CreditCard } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <h1>Profile</h1>
      </header>

      {/* Profile Info */}
      <div className="profile-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <div className="rating">
            <Star size={16} fill="currentColor" />
            <span>4.9</span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="profile-details">
          <div className="detail-item">
            <Mail size={20} />
            <div>
              <label>Email</label>
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="detail-item">
            <Phone size={20} />
            <div>
              <label>Phone</label>
              <span>+1 (555) 123-4567</span>
            </div>
          </div>

          <div className="detail-item">
            <MapPin size={20} />
            <div>
              <label>Home Address</label>
              <span>Add your home address</span>
            </div>
          </div>

          <div className="detail-item">
            <CreditCard size={20} />
            <div>
              <label>Payment Method</label>
              <span>Add payment method</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="profile-menu">
          <button className="menu-item">
            <span>Ride History</span>
            <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>

          <button className="menu-item">
            <span>Payment Methods</span>
            <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>

          <button className="menu-item">
            <span>Settings</span>
            <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>

          <button className="menu-item">
            <span>Help & Support</span>
            <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>

          <button className="menu-item">
            <span>About</span>
            <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>

        {/* Logout Button */}
        <button className="logout-button-full" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;