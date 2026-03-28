import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">RAJINI PHARMA</h3>
            <p className="text-gray-300 text-sm mb-4">
              Your trusted pharmacy for generic medicines and surgical supplies. 
              Serving the community with quality healthcare products.
            </p>
            <div className="flex space-x-4">
              <FaFacebook className="text-xl hover:text-primary-400 cursor-pointer transition" />
              <FaTwitter className="text-xl hover:text-primary-400 cursor-pointer transition" />
              <FaInstagram className="text-xl hover:text-primary-400 cursor-pointer transition" />
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                <p>
                  No. 153/1A1A1, Ground Floor & First Floor,<br />
                  Periyasavalai Main Road, Anna Nagar,<br />
                  Thirukoilur Town, Kallakurichi District - 605757
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone />
                <p>Available at store</p>
              </div>
              <div className="flex items-center space-x-2">
                <FaEnvelope />
                <p>info@rajinipharma.com</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/medicines" className="hover:text-primary-400 transition">Browse Medicines</a></li>
              <li><a href="/orders" className="hover:text-primary-400 transition">Track Orders</a></li>
              <li><a href="#" className="hover:text-primary-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-400 transition">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-primary-400 transition">Return Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} RAJINI PHARMA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

