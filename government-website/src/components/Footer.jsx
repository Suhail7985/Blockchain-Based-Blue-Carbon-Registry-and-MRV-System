import React from 'react';
import { 
  FaFacebook, 
  FaTwitter, 
  FaYoutube, 
  FaLinkedin,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About Us', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Schemes', href: '#schemes' },
    { label: 'Notifications', href: '#notifications' },
    { label: 'Contact', href: '#contact' },
  ];

  const policies = [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Use', href: '#terms' },
    { label: 'Accessibility Statement', href: '#accessibility' },
    { label: 'Disclaimer', href: '#disclaimer' },
    { label: 'Right to Information', href: '#rti' },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: '#', label: 'Facebook' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaYoutube, href: '#', label: 'YouTube' },
    { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gov-blue-900 text-white" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2" role="list">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Government Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Government Policies</h3>
            <ul className="space-y-2" role="list">
              {policies.map((policy) => (
                <li key={policy.label}>
                  <a
                    href={policy.href}
                    className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                  >
                    {policy.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <ul className="space-y-3" role="list">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="w-5 h-5 text-gov-blue-400 mt-1 flex-shrink-0" aria-hidden="true" />
                <address className="text-gray-300 not-italic">
                  Government Building<br />
                  [Street Address]<br />
                  [City, State] - [PIN Code]
                </address>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="w-5 h-5 text-gov-blue-400 flex-shrink-0" aria-hidden="true" />
                <a
                  href="tel:+911234567890"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  +91-123-456-7890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="w-5 h-5 text-gov-blue-400 flex-shrink-0" aria-hidden="true" />
                <a
                  href="mailto:info@govportal.gov.in"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                >
                  info@govportal.gov.in
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 bg-gov-blue-800 hover:bg-gov-blue-700 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label={`Follow us on ${social.label}`}
                    title={social.label}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-300 mb-2">Helpline</p>
              <p className="text-lg font-semibold">1800-XXX-XXXX</p>
              <p className="text-xs text-gray-400 mt-1">24x7 Support</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gov-blue-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-300 text-sm">
              © {currentYear} Government Portal. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a
                href="#terms"
                className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
              >
                Terms & Conditions
              </a>
              <span className="text-gray-500">|</span>
              <a
                href="#privacy"
                className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
              >
                Privacy Policy
              </a>
              <span className="text-gray-500">|</span>
              <a
                href="#sitemap"
                className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
              >
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
