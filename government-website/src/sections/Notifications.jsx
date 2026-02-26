import React from 'react';
import { FaFilePdf, FaDownload } from 'react-icons/fa';

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      date: '2024-01-15',
      title: 'New Scheme: Digital India Initiative 2024',
      category: 'Schemes',
    },
    {
      id: 2,
      date: '2024-01-12',
      title: 'Public Holiday Notice - Republic Day',
      category: 'Announcements',
    },
    {
      id: 3,
      date: '2024-01-10',
      title: 'Updated Guidelines for Online Applications',
      category: 'Guidelines',
    },
    {
      id: 4,
      date: '2024-01-08',
      title: 'Maintenance Schedule - System Upgrade',
      category: 'System Updates',
    },
    {
      id: 5,
      date: '2024-01-05',
      title: 'Citizen Feedback Portal Now Live',
      category: 'New Features',
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section
      id="notifications"
      className="py-16 lg:py-24 bg-gray-50"
      aria-labelledby="notifications-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="notifications-heading" className="text-3xl md:text-4xl font-bold text-gov-blue-900 mb-4">
            Important Notifications
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest announcements, schemes, and important information.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gov-blue-600 bg-gov-blue-100 px-3 py-1 rounded-full">
                          {notification.category}
                        </span>
                        <time
                          dateTime={notification.date}
                          className="text-sm text-gray-500"
                        >
                          {formatDate(notification.date)}
                        </time>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`#notification-${notification.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gov-blue-600 text-white rounded-md hover:bg-gov-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue-600"
                        aria-label={`Download PDF for ${notification.title}`}
                      >
                        <FaFilePdf className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden sm:inline">PDF</span>
                        <FaDownload className="w-4 h-4 sm:hidden" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 px-6 py-4 text-center">
              <a
                href="#all-notifications"
                className="text-gov-blue-600 font-medium hover:text-gov-blue-700 focus:outline-none focus:ring-2 focus:ring-gov-blue-600 rounded"
              >
                View All Notifications →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Notifications;
