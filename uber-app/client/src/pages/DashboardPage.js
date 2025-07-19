import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Car, User, MapPin, Clock, LogOut, Star } from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBookRide = () => {
    navigate('/ride');
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>🇧🇩 স্বাগতম, {user?.name}! | Welcome back!</h1>
            <p>আজ ঢাকায় কোথায় যেতে চান? | Where would you like to go in Dhaka today?</p>
          </div>
          <div className="header-actions">
            <Link to="/profile" className="profile-button">
              <User size={20} />
            </Link>
            <button onClick={handleLogout} className="logout-button">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>🚗 দ্রুত সেবা | Quick Actions</h2>
          <div className="action-grid">
            <button className="action-card primary" onClick={handleBookRide}>
              <Car size={32} />
              <h3>🚗 রাইড বুক করুন</h3>
              <p>কয়েক মিনিটেই রাইড পান | Get a ride in minutes</p>
            </button>
            
            <div className="action-card">
              <MapPin size={32} />
              <h3>📍 সংরক্ষিত স্থান</h3>
              <p>বাড়ি, অফিস এবং আরও | Home, Work & more</p>
            </div>
            
            <div className="action-card">
              <Clock size={32} />
              <h3>⏰ সময় নির্ধারণ</h3>
              <p>পরে যাওয়ার পরিকল্পনা | Schedule for later</p>
            </div>
            
            <div className="action-card">
              <Star size={32} />
              <h3>📋 রাইড ইতিহাস</h3>
              <p>পূর্বের ভ্রমণ দেখুন | View past trips</p>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <Car size={20} />
              </div>
              <div className="activity-details">
                <h4>Welcome to UberClone!</h4>
                <p>Your account has been created successfully</p>
                <span className="activity-time">Just now</span>
              </div>
            </div>
          </div>
        </section>

        {/* Service Types */}
        <section className="service-types">
          <h2>🚗 আপনার রাইড বেছে নিন | Choose Your Ride</h2>
          <div className="service-grid">
            <div className="service-card">
              <div className="service-icon">🚗</div>
              <div className="service-info">
                <h4>RideGo Mini</h4>
                <p>সাশ্রয়ী দৈনন্দিন রাইড | Affordable everyday rides</p>
                <span className="service-price">৳80-120</span>
              </div>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🚙</div>
              <div className="service-info">
                <h4>RideGo Standard</h4>
                <p>স্বাচ্ছন্দ্যময় যাত্রা | Comfortable rides</p>
                <span className="service-price">৳120-180</span>
              </div>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🚐</div>
              <div className="service-info">
                <h4>RideGo Premium</h4>
                <p>বিলাসবহুল গাড়ি | Luxury cars</p>
                <span className="service-price">৳200-300</span>
              </div>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🏍️</div>
              <div className="service-info">
                <h4>RideGo Bike</h4>
                <p>দ্রুত মোটর বাইক | Quick motorcycle rides</p>
                <span className="service-price">৳40-80</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom CTA */}
      <div className="bottom-cta">
        <button className="cta-button" onClick={handleBookRide}>
          <Car size={24} />
          🚗 এখনই রাইড বুক করুন | Book Your Ride Now
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;